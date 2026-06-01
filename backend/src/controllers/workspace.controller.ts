import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Workspace } from '../models/workspace.model';
import { Activity } from '../models/activity.model';
import { AppError } from '../utils/appError';
import { Task } from '../models/task.model';
import { Board } from '../models/board.model';
import { Notification } from '../models/notification.model';
import { Organization } from '../models/organization.model';
import { SubTeam } from '../models/subteam.model';
import { getIO } from '../utils/socket';
import { cacheService } from '../services/cache.service';

// Helper function để migrate data cũ (thêm projectKey và format lại members)
const migrateWorkspace = async (workspace: any) => {
    if (!workspace.projectKey) {
        workspace.projectKey = 'PRJ-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
    workspace.members = workspace.members.map((m: any) => {
        if (m.userId) return m;
        return { userId: m, role: 'Developer' };
    });

    if (!workspace.organizationId) {
        // Tìm xem user owner này đã có Org chưa, nếu chưa thì tạo một cái mặc định
        let org = await Organization.findOne({ ownerId: workspace.ownerId });
        if (!org) {
            org = await Organization.create({
                name: 'My Workspace',
                ownerId: workspace.ownerId,
                members: workspace.members.map((m: any) => ({
                    userId: m.userId,
                    role: m.userId.toString() === workspace.ownerId.toString() ? 'Owner' : 'Member',
                    status: 'Joined'
                }))
            });
        }
        workspace.organizationId = org._id;
    }
};

export const workspaceController = {
    getWorkspacesByOrg: async (req: Request, res: Response) => {
        try {
            const orgId = req.query.orgId as string;
            const userId = (req as any).user.id;
            const cacheKey = `user_workspaces_${userId}_org_${orgId}`;

            const cachedWorkspaces = await cacheService.get(cacheKey);
            if (cachedWorkspaces) {
                return res.status(200).json({ status: 'success', data: cachedWorkspaces });
            }
            
            if (!orgId || orgId === 'undefined' || orgId === 'null') {
                // Nếu không có orgId, tìm các workspace của user (tạm thời để backward compatible)
                const workspaces = await Workspace.find({ 'members.userId': userId }).lean();
                return res.status(200).json({ status: 'success', data: workspaces });
            }

            const workspaces = await Workspace.find({ 
                organizationId: orgId,
                'members.userId': userId 
            }).lean();
            
            await cacheService.set(cacheKey, workspaces, 3600);
            res.status(200).json({ status: 'success', data: workspaces });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route POST /api/v1/workspaces/cloud
     * @desc Tạo một Cloud Workspace (IDE) độc lập
     */
    createCloudWorkspace: async (req: Request, res: Response) => {
        try {
            const { name, description, orgId, language } = req.body;
            const userId = (req as any).user.id;

            const generateProjectKey = (name: string) => {
                const words = name.split(' ');
                let key = words.map(w => w[0]).join('').substring(0, 4).toUpperCase();
                if (!key) key = 'CLD';
                return `${key}-${Math.floor(1000 + Math.random() * 9000)}`;
            };

            const workspace = await Workspace.create({
                name: `${name}`,
                description: description || '',
                projectKey: generateProjectKey(name),
                organizationId: orgId,
                ownerId: userId,
                isCloud: true,
                members: [{ userId: userId, role: 'Manager', obsTitle: 'Owner' }]
            });

            // Tự động sinh ra cấu trúc file cơ bản cho dự án
            const File = mongoose.model('File');
            
            // Basic Node.js + React template
            const defaultFiles = [
                {
                    workspaceId: workspace._id,
                    path: 'package.json',
                    type: 'file',
                    content: `{\n  "name": "cloud-project",\n  "version": "1.0.0",\n  "scripts": {\n    "install-all": "cd frontend && npm install && cd ../backend && npm install",\n    "dev": "echo 'Vui lòng cd vào frontend hoặc backend để chạy dev'"\n  }\n}`
                },
                {
                    workspaceId: workspace._id,
                    path: 'frontend',
                    type: 'directory',
                    content: ''
                },
                {
                    workspaceId: workspace._id,
                    path: 'frontend/package.json',
                    type: 'file',
                    content: `{\n  "name": "frontend",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "vite": "^5.0.0",\n    "@vitejs/plugin-react": "^4.2.0"\n  }\n}`
                },
                {
                    workspaceId: workspace._id,
                    path: 'backend',
                    type: 'directory',
                    content: ''
                },
                {
                    workspaceId: workspace._id,
                    path: 'backend/package.json',
                    type: 'file',
                    content: `{\n  "name": "backend",\n  "version": "1.0.0",\n  "main": "index.js",\n  "dependencies": {\n    "express": "^4.18.2"\n  },\n  "scripts": {\n    "start": "node index.js"\n  }\n}`
                }
            ];

            await File.insertMany(defaultFiles);

            // Log Activity
            await Activity.create({
                workspaceId: workspace._id,
                userId: userId,
                action: 'tạo',
                targetName: `Cloud IDE "${name}"`,
                targetType: 'Workspace'
            });

            // Xóa cache danh sách workspace
            await cacheService.del(`user_workspaces_${userId}_org_${orgId || 'undefined'}`);

            res.status(201).json({
                status: 'success',
                message: 'Tạo dự án Cloud thành công!',
                data: workspace
            });

        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route GET /api/v1/workspaces/:id/activities
     * @desc Lấy danh sách hoạt động
     */
    getActivities: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const activities = await Activity.find({ workspaceId: id })
                .populate('userId', 'full_name avatar_url')
                .sort({ createdAt: -1 })
                .limit(50);
            
            res.status(200).json({ status: 'success', data: activities });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route GET /api/v1/workspaces/all/activities
     * @desc Lấy danh sách hoạt động từ tất cả dự án (hoặc theo orgId)
     */
    getAllActivities: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const orgId = req.query.orgId as string;

            let workspaceIds: string[] = [];

            if (orgId) {
                const workspaces = await Workspace.find({ 
                    organizationId: orgId,
                    $or: [
                        { 'members.userId': userId },
                        { ownerId: userId }
                    ]
                }).lean();
                // Chú ý: Thực ra member bình thường còn được tính qua SubTeam
                // Nhưng để đơn giản lấy tất cả workspace trong Org mà user có quyền truy cập
                const SubTeam = mongoose.model('SubTeam');
                const userSubTeams = await SubTeam.find({
                    organizationId: orgId,
                    'members.userId': userId
                }).lean();
                const userSubTeamIds = userSubTeams.map((t: any) => t._id);

                const allWorkspaces = await Workspace.find({ 
                    organizationId: orgId,
                    $or: [
                        { 'members.userId': userId },
                        { ownerId: userId },
                        { subTeamIds: { $in: userSubTeamIds } }
                    ]
                }).lean();
                workspaceIds = allWorkspaces.map(w => w._id.toString());
            } else {
                const workspaces = await Workspace.find({ 
                    'members.userId': userId,
                    organizationId: { $exists: false }
                }).lean();
                workspaceIds = workspaces.map(w => w._id.toString());
            }

            const activities = await Activity.find({ workspaceId: { $in: workspaceIds } })
                .populate('userId', 'full_name avatar_url')
                .sort({ createdAt: -1 })
                .limit(50);
            
            res.status(200).json({ status: 'success', data: activities });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route GET /api/v1/workspaces/:id/members
     * @desc Lấy danh sách thành viên trong Workspace
     */
    getMembers: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const workspace = await Workspace.findById(id)
                .populate('members.userId', 'full_name email avatar_url')
                .populate({
                    path: 'subTeamIds',
                    populate: {
                        path: 'members.userId',
                        select: 'full_name email avatar_url'
                    }
                });
            if (!workspace) throw new AppError(404, 'Không tìm thấy Workspace');

            const org = workspace.organizationId ? await Organization.findById(workspace.organizationId) : null;
            const getOrgRole = (uId: string) => {
                const m = org?.members?.find(om => om.userId.toString() === uId);
                return m?.role || 'Developer';
            };

            if (workspace.subTeamIds) {
                const subTeamMembers = workspace.subTeamIds.flatMap((team: any) => team.members || []);
                subTeamMembers.forEach((teamMember: any) => {
                    if (!teamMember.userId) return;
                    const teamMemberIdStr = teamMember.userId._id ? teamMember.userId._id.toString() : teamMember.userId.toString();
                    const existingMember = workspace.members.find((m: any) => 
                        (m.userId?._id?.toString() || m.userId?.toString()) === teamMemberIdStr
                    );
                    if (!existingMember) {
                        workspace.members.push({
                            userId: teamMember.userId,
                            role: teamMember.role === 'Leader' ? 'Leader' : getOrgRole(teamMemberIdStr)
                        } as any);
                    }
                });
            }

            // Format data to match previous interface where it was just array of users, or return full objects.
            // But we need to return the role/obsTitle too! We'll just return members directly.
            res.status(200).json({ status: 'success', data: workspace.members });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route GET /api/v1/workspaces/:id/workload
     * @desc Lấy danh sách thành viên kèm theo khối lượng công việc (Workload)
     */
    getMembersWorkload: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            const workspace = await Workspace.findById(id)
                .populate('members.userId', 'full_name email avatar_url')
                .populate({
                    path: 'subTeamIds',
                    populate: {
                        path: 'members.userId',
                        select: 'full_name email avatar_url'
                    }
                });
            if (!workspace) throw new AppError(404, 'Không tìm thấy Workspace');

            const org = workspace.organizationId ? await Organization.findById(workspace.organizationId) : null;
            const getOrgRole = (uId: string) => {
                const m = org?.members?.find(om => om.userId.toString() === uId);
                return m?.role || 'Developer';
            };

            if (workspace.subTeamIds) {
                const subTeamMembers = workspace.subTeamIds.flatMap((team: any) => team.members || []);
                subTeamMembers.forEach((teamMember: any) => {
                    if (!teamMember.userId) return;
                    const teamMemberIdStr = teamMember.userId._id ? teamMember.userId._id.toString() : teamMember.userId.toString();
                    const existingMember = workspace.members.find((m: any) => 
                        (m.userId?._id?.toString() || m.userId?.toString()) === teamMemberIdStr
                    );
                    if (!existingMember) {
                        workspace.members.push({
                            userId: teamMember.userId,
                            role: teamMember.role === 'Leader' ? 'Leader' : getOrgRole(teamMemberIdStr)
                        } as any);
                    }
                });
            }
            if (!workspace) throw new AppError(404, 'Không tìm thấy Workspace');

            const boards = await Board.find({ workspaceId: id }).select('_id title').lean();
            const boardIds = boards.map(b => b._id);

            const workloadAggregation = await Task.aggregate([
                {
                    $match: {
                        boardId: { $in: boardIds },
                        status: { $ne: 'Done' }
                    }
                },
                {
                    $unwind: '$assignees'
                },
                {
                    $group: {
                        _id: '$assignees',
                        activeTasksCount: { $sum: 1 },
                        activeStoryPoints: { $sum: { $ifNull: ['$storyPoints', 0] } },
                        participatedBoardIds: { $addToSet: '$boardId' }
                    }
                }
            ]);

            const workloadMap: Record<string, any> = workloadAggregation.reduce((acc, curr) => {
                acc[curr._id.toString()] = {
                    activeTasksCount: curr.activeTasksCount,
                    activeStoryPoints: curr.activeStoryPoints,
                    participatedBoards: curr.participatedBoardIds.map((bid: any) => {
                        const b = boards.find(board => board._id.toString() === bid.toString());
                        return b ? { _id: b._id, title: b.title } : null;
                    }).filter(Boolean)
                };
                return acc;
            }, {});

            const membersWithWorkload = workspace.members.map(member => {
                const userIdStr = member.userId ? (member.userId as any)._id.toString() : member.toString();
                const workload = workloadMap[userIdStr] || {
                    activeTasksCount: 0,
                    activeStoryPoints: 0,
                    participatedBoards: []
                };

                const isOverloaded = workload.activeTasksCount > 5 || workload.activeStoryPoints > 20;

                return {
                    ...((member as any).toObject ? (member as any).toObject() : member),
                    workload: {
                        ...workload,
                        isOverloaded
                    }
                };
            });

            res.status(200).json({ status: 'success', data: membersWithWorkload });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route POST /api/v1/workspaces/:id/members
     * @desc Thêm thành viên vào Workspace
     * @access Private
     */
    addMember: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { userId, role } = req.body;
            const currentUserId = (req as any).user.id;

            const workspace = await Workspace.findById(id);
            if (!workspace) throw new AppError(404, 'Không tìm thấy Workspace');

            if (workspace.members.some(m => (m.userId ? m.userId.toString() : m.toString()) === userId)) {
                throw new AppError(400, 'Người dùng đã có trong Workspace');
            }

            // Đảm bảo Workspace đã được map với Organization
            await migrateWorkspace(workspace);

            // Kiểm tra xem user có trong Organization không
            const org = await Organization.findById(workspace.organizationId);
            if (!org) throw new AppError(500, 'Lỗi hệ thống: Không tìm thấy Organization của Workspace này');

            const isOrgMember = org.members.some(m => m.userId.toString() === userId && m.status === 'Joined');
            if (!isOrgMember) {
                throw new AppError(400, 'Chỉ có thể thêm thành viên đã tham gia vào Organization của bạn');
            }
            
            const orgMember = org.members.find(m => m.userId.toString() === userId);
            const defaultRole = orgMember?.role || 'Developer';

            // Thêm thẳng vào Workspace
            workspace.members.push({ userId, role: role || defaultRole } as any);
            await workspace.save();

            // Xóa cache
            await cacheService.del(`user_workspaces_${currentUserId}_org_${workspace.organizationId}`);
            await cacheService.del(`user_workspaces_${userId}_org_${workspace.organizationId}`);

            // Gửi Notification thông báo đã được add vào dự án (không cần accept)
            const newNotification = await Notification.create({
                userId,
                type: 'WorkspaceInvite', // Vẫn có thể dùng type này nhưng không cần actionStatus
                content: `Bạn đã được thêm vào không gian làm việc: ${workspace.name}`,
                workspaceId: workspace._id,
                senderId: currentUserId
            });

            const io = getIO();
            io.to(userId.toString()).emit('new_notification', newNotification);

            res.status(200).json({
                status: 'success',
                message: 'Đã thêm thành viên vào dự án thành công',
                data: { workspace }
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route DELETE /api/v1/workspaces/:id/members/:userId
     * @desc Xóa thành viên khỏi Workspace
     * @access Private
     */
    removeMember: async (req: Request, res: Response) => {
        try {
            const { id, userId } = req.params;
            const currentUserId = (req as any).user.id;

            const workspace = await Workspace.findById(id);
            if (!workspace) throw new AppError(404, 'Không tìm thấy Workspace');

            if (workspace.ownerId.toString() === userId) {
                throw new AppError(400, 'Không thể xóa chủ sở hữu');
            }

            workspace.members = workspace.members.filter(m => (m.userId ? m.userId.toString() : m.toString()) !== userId);
            await migrateWorkspace(workspace);
            await workspace.save();

            // Xóa cache
            await cacheService.del(`user_workspaces_${currentUserId}_org_${workspace.organizationId}`);
            await cacheService.del(`user_workspaces_${userId}_org_${workspace.organizationId}`);

            res.status(200).json({
                status: 'success',
                message: 'Đã xóa thành viên khỏi Workspace'
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route PUT /api/v1/workspaces/:id/members/:userId
     * @desc Cập nhật Role và OBS Title của thành viên (Chỉ Admin)
     */
    updateMember: async (req: Request, res: Response) => {
        try {
            const { id, userId } = req.params;
            const { role, obsTitle, isBlockedFromIDE } = req.body;
            const currentUserId = (req as any).user.id;

            const workspace = await Workspace.findById(id);
            if (!workspace) throw new AppError(404, 'Không tìm thấy Workspace');

            // Chủ sở hữu không thể bị thay đổi quyền
            if (workspace.ownerId.toString() === userId && role && role !== 'Manager') {
                throw new AppError(400, 'Không thể thay đổi quyền của chủ sở hữu');
            }

            // Tìm và cập nhật member
            let memberIndex = workspace.members.findIndex(m => (m.userId ? m.userId.toString() : m.toString()) === userId);
            
            if (memberIndex === -1) {
                // Nếu không có trong members trực tiếp, có thể user từ SubTeam.
                // Lấy role từ Organization để làm mặc định
                const org = workspace.organizationId ? await Organization.findById(workspace.organizationId) : null;
                const orgMember = org?.members?.find(m => m.userId.toString() === userId);
                const defaultRole = orgMember?.role || 'Developer';
                
                workspace.members.push({ userId, role: role || defaultRole } as any);
                memberIndex = workspace.members.length - 1;
            }

            if (role) {
                const oldRole = workspace.members[memberIndex].role;
                workspace.members[memberIndex].role = role;
                
                // Đồng bộ role lên Organization
                if (workspace.organizationId) {
                    await Organization.updateOne(
                        { _id: workspace.organizationId, "members.userId": userId },
                        { $set: { "members.$.role": role } }
                    );

                    // Đồng bộ role lên SubTeam
                    if (oldRole === 'Leader' && role !== 'Leader') {
                        await SubTeam.updateMany(
                            { organizationId: workspace.organizationId, "members.userId": userId, "members.role": 'Leader' },
                            { $set: { "members.$.role": 'Member' } }
                        );
                    } else if (oldRole !== 'Leader' && role === 'Leader') {
                        await SubTeam.updateMany(
                            { organizationId: workspace.organizationId, "members.userId": userId, "members.role": 'Member' },
                            { $set: { "members.$.role": 'Leader' } }
                        );
                    }
                }
            }
            if (obsTitle !== undefined) workspace.members[memberIndex].obsTitle = obsTitle; // Có thể xóa bỏ bằng rỗng
            if (isBlockedFromIDE !== undefined) workspace.members[memberIndex].isBlockedFromIDE = isBlockedFromIDE;

            workspace.markModified('members');
            await migrateWorkspace(workspace);
            await workspace.save();

            // Xóa cache
            await cacheService.del(`user_workspaces_${currentUserId}_org_${workspace.organizationId}`);
            await cacheService.del(`user_workspaces_${userId}_org_${workspace.organizationId}`);

            res.status(200).json({
                status: 'success',
                message: 'Cập nhật thành viên thành công',
                data: { member: workspace.members[memberIndex] }
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route POST /api/v1/workspaces/:id/subteams
     * @desc Gán SubTeam vào Workspace (RBAC)
     */
    addSubTeam: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { subTeamId } = req.body;
            const currentUserId = (req as any).user.id;

            const workspace = await Workspace.findById(id);
            if (!workspace) throw new AppError(404, 'Không tìm thấy Workspace');

            // Kiểm tra quyền Admin
            const isOwner = workspace.ownerId.toString() === currentUserId;
            const currentUserMember = workspace.members.find(m => (m.userId ? m.userId.toString() : m.toString()) === currentUserId);
            const isManager = isOwner || (currentUserMember && currentUserMember.role === 'Manager');

            if (!isManager) {
                throw new AppError(403, 'Chỉ Quản lý (Manager) mới có quyền gán phòng ban');
            }

            if (!workspace.subTeamIds) {
                workspace.subTeamIds = [];
            }

            if (workspace.subTeamIds.includes(subTeamId)) {
                throw new AppError(400, 'Phòng ban này đã được gán vào dự án');
            }

            workspace.subTeamIds.push(subTeamId);
            await workspace.save();

            // Xóa cache
            await cacheService.del(`user_workspaces_${currentUserId}_org_${workspace.organizationId}`);

            res.status(200).json({
                status: 'success',
                message: 'Đã thêm phòng ban vào dự án'
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route DELETE /api/v1/workspaces/:id/subteams/:subTeamId
     * @desc Xóa SubTeam khỏi Workspace
     */
    removeSubTeam: async (req: Request, res: Response) => {
        try {
            const { id, subTeamId } = req.params;
            const currentUserId = (req as any).user.id;

            const workspace = await Workspace.findById(id);
            if (!workspace) throw new AppError(404, 'Không tìm thấy Workspace');

            // Kiểm tra quyền Admin
            const isOwner = workspace.ownerId.toString() === currentUserId;
            const currentUserMember = workspace.members.find(m => (m.userId ? m.userId.toString() : m.toString()) === currentUserId);
            const isManager = isOwner || (currentUserMember && currentUserMember.role === 'Manager');

            if (!isManager) {
                throw new AppError(403, 'Chỉ Quản lý (Manager) mới có quyền xóa phòng ban');
            }

            if (workspace.subTeamIds) {
                workspace.subTeamIds = workspace.subTeamIds.filter(id => id.toString() !== subTeamId);
                await workspace.save();
                
                // Xóa cache
                await cacheService.del(`user_workspaces_${currentUserId}_org_${workspace.organizationId}`);
            }

            res.status(200).json({
                status: 'success',
                message: 'Đã xóa phòng ban khỏi dự án'
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    }
};
