import { Request, Response } from 'express';
import { Organization } from '../models/organization.model';
import { Workspace } from '../models/workspace.model';
import { SubTeam } from '../models/subteam.model';
import { Notification } from '../models/notification.model';
import { User } from '../models/user.model';
import { Board } from '../models/board.model';
import { Task } from '../models/task.model';
import { AppError } from '../utils/appError';
import { getIO } from '../utils/socket';
import mongoose from 'mongoose';
import { cacheService } from '../services/cache.service';
import { ensureDefaultRoles } from '../utils/defaultRoles';

export const organizationController = {
    /**
     * @route GET /api/v1/organizations
     * @desc Lấy danh sách organizations của user
     */
    getOrganizations: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const cacheKey = `user_orgs_${userId}`;

            // 1. Kiểm tra Cache
            const cachedOrgs = await cacheService.get(cacheKey);
            if (cachedOrgs) {
                return res.status(200).json({ status: 'success', data: cachedOrgs });
            }
            
            // Tìm các Org mà user là thành viên và đã Joined
            const organizations = await Organization.find({
                'members': {
                    $elemMatch: { userId, status: 'Joined' }
                }
            }).lean();
            
            // 2. Lưu vào Cache (1 giờ)
            await cacheService.set(cacheKey, organizations, 3600);

            res.status(200).json({ status: 'success', data: organizations });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route POST /api/v1/organizations
     * @desc Tạo Organization mới
     */
    createOrganization: async (req: Request, res: Response) => {
        try {
            const { name, description } = req.body;
            const userId = (req as any).user.id;
            
            const organization = await Organization.create({
                name,
                description,
                ownerId: userId,
                members: [{ userId, role: 'Owner', status: 'Joined' }]
            });
            
            // Xóa cache của user tạo
            await cacheService.del(`user_orgs_${userId}`);
            
            // Tạo default roles
            await ensureDefaultRoles(organization._id.toString());
            
            res.status(201).json({ status: 'success', data: organization });
        } catch (error: any) {
            res.status(400).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route GET /api/v1/organizations/:id/members
     * @desc Lấy danh sách thành viên của Organization
     */
    getMembers: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const organization = await Organization.findById(id).populate('members.userId', 'full_name email avatar_url');
            if (!organization) throw new AppError(404, 'Không tìm thấy Organization');

            res.status(200).json({ status: 'success', data: organization.members });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route GET /api/v1/organizations/:id/workload
     * @desc Lấy danh sách thành viên kèm theo khối lượng công việc trên toàn bộ Tổ chức
     */
    getMembersWorkload: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            const organization = await Organization.findById(id).populate('members.userId', 'full_name email avatar_url');
            if (!organization) throw new AppError(404, 'Không tìm thấy Organization');

            // Tìm tất cả Workspace thuộc Organization này
            const workspaces = await Workspace.find({ organizationId: id }).lean();
            const workspaceIds = workspaces.map(w => w._id);

            // Tìm tất cả Board thuộc các Workspace này
            const boards = await Board.find({ workspaceId: { $in: workspaceIds } }).select('_id title').lean();
            const boardIds = boards.map((b: any) => b._id);

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

            const workloadMap: Record<string, any> = workloadAggregation.reduce((acc: any, curr: any) => {
                acc[curr._id.toString()] = {
                    activeTasksCount: curr.activeTasksCount,
                    activeStoryPoints: curr.activeStoryPoints,
                    participatedBoards: curr.participatedBoardIds.map((bid: any) => {
                        const b = boards.find((board: any) => board._id.toString() === bid.toString());
                        return b ? { _id: b._id, title: b.title } : null;
                    }).filter(Boolean)
                };
                return acc;
            }, {});

            const membersWithWorkload = organization.members.map(member => {
                if (!member.userId) return null;
                const memberId = (member.userId as any)._id.toString();
                const workload = workloadMap[memberId] || {
                    activeTasksCount: 0,
                    activeStoryPoints: 0,
                    participatedBoards: []
                };

                return {
                    ...((member as any).toObject ? (member as any).toObject() : member),
                    workload
                };
            }).filter(Boolean);

            res.status(200).json({ status: 'success', data: membersWithWorkload });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route POST /api/v1/organizations/:id/members
     * @desc Mời thành viên vào Organization
     */
    addMember: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { userId, role } = req.body;
            const currentUserId = (req as any).user.id;

            const org = await Organization.findById(id);
            if (!org) throw new AppError(404, 'Không tìm thấy Organization');

            // Chỉ Owner/Admin mới được mời
            const currentUserMember = org.members.find(m => m.userId.toString() === currentUserId);
            if (!currentUserMember || (currentUserMember.role !== 'Owner' && currentUserMember.role !== 'Manager')) {
                throw new AppError(403, 'Bạn không có quyền mời thành viên');
            }

            if (org.members.some(m => m.userId.toString() === userId)) {
                throw new AppError(400, 'Người dùng đã có trong Organization');
            }

            org.members.push({ userId: new mongoose.Types.ObjectId(userId), role: role || 'Developer', status: 'Pending' });
            await org.save();

            // Gửi Notification
            const newNotification = await Notification.create({
                userId: new mongoose.Types.ObjectId(userId),
                type: 'OrganizationInvite',
                content: `Bạn được mời tham gia tổ chức: ${org.name}`,
                organizationId: org._id,
                senderId: currentUserId,
                actionStatus: 'pending'
            });

            const io = getIO();
            io.to(userId.toString()).emit('new_notification', newNotification);

            res.status(200).json({ status: 'success', message: 'Đã gửi lời mời tham gia tổ chức' });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route POST /api/v1/organizations/:id/accept-invite
     * @desc Xác nhận lời mời vào Organization
     */
    acceptInvite: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { notificationId, action } = req.body; // 'accept' | 'decline'
            const currentUserId = (req as any).user.id;

            const org = await Organization.findById(id);
            if (!org) throw new AppError(404, 'Không tìm thấy Organization');

            const memberIndex = org.members.findIndex(m => m.userId.toString() === currentUserId);
            if (memberIndex === -1) throw new AppError(404, 'Bạn không có lời mời trong Tổ chức này');

            if (action === 'accept') {
                org.members[memberIndex].status = 'Joined';
            } else if (action === 'decline') {
                org.members.splice(memberIndex, 1);
            } else {
                throw new AppError(400, 'Hành động không hợp lệ');
            }

            await org.save();

            if (notificationId) {
                await Notification.findByIdAndUpdate(notificationId, { actionStatus: action === 'accept' ? 'accepted' : 'declined', isRead: true });
            }

            // Xóa cache của user
            await cacheService.del(`user_orgs_${currentUserId}`);

            res.status(200).json({ status: 'success', message: action === 'accept' ? 'Đã tham gia Tổ chức' : 'Đã từ chối lời mời' });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route DELETE /api/v1/organizations/:id/members/:userId
     * @desc Xóa thành viên khỏi Organization
     */
    removeMember: async (req: Request, res: Response) => {
        try {
            const { id, userId } = req.params;
            const currentUserId = (req as any).user.id;

            const org = await Organization.findById(id);
            if (!org) throw new AppError(404, 'Không tìm thấy Organization');

            const currentUserMember = org.members.find(m => m.userId.toString() === currentUserId);
            const targetMember = org.members.find(m => m.userId.toString() === userId);
            
            // Chỉ Owner hoặc Admin mới có quyền xóa người khác, hoặc tự rời nhóm
            if (currentUserId !== userId && (!currentUserMember || (currentUserMember.role !== 'Owner' && currentUserMember.role !== 'Manager'))) {
                throw new AppError(403, 'Bạn không có quyền xóa thành viên này');
            }

            // Admin không được xóa Owner
            if (currentUserId !== userId && currentUserMember?.role === 'Manager' && targetMember?.role === 'Owner') {
                throw new AppError(403, 'Quản trị viên không thể xóa Owner');
            }

            // Owner không thể tự rời nhóm nếu là Owner duy nhất
            if (currentUserId === userId) {
                const isOwner = org.members.some(m => m.userId.toString() === userId && m.role === 'Owner');
                const ownerCount = org.members.filter(m => m.role === 'Owner').length;
                if (isOwner && ownerCount <= 1) {
                    throw new AppError(400, 'Bạn là Owner duy nhất. Hãy nhường quyền Owner trước khi rời nhóm.');
                }
            }

            org.members = org.members.filter(m => m.userId.toString() !== userId);
            await org.save();

            // Xóa cache của user bị xóa và user thực hiện xóa
            await cacheService.del(`user_orgs_${userId}`);
            await cacheService.del(`user_orgs_${currentUserId}`);

            res.status(200).json({ status: 'success', message: 'Đã xóa thành viên khỏi tổ chức' });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route PUT /api/v1/organizations/:id/members/:userId
     * @desc Cập nhật vai trò thành viên
     */
    updateMember: async (req: Request, res: Response) => {
        try {
            const { id, userId } = req.params;
            const { role } = req.body;
            const currentUserId = (req as any).user.id;

            const org = await Organization.findById(id);
            if (!org) throw new AppError(404, 'Không tìm thấy Organization');

            const currentUserMember = org.members.find(m => m.userId.toString() === currentUserId);
            // Chỉ Owner hoặc Admin mới có quyền sửa người khác
            if (!currentUserMember || (currentUserMember.role !== 'Owner' && currentUserMember.role !== 'Manager')) {
                throw new AppError(403, 'Bạn không có quyền cập nhật thành viên này');
            }

            const targetMember = org.members.find(m => m.userId.toString() === userId);
            if (!targetMember) throw new AppError(404, 'Thành viên không tồn tại trong tổ chức');

            // Admin không được sửa quyền của Owner
            if (currentUserMember.role === 'Manager' && targetMember.role === 'Owner') {
                throw new AppError(403, 'Quản trị viên không thể thay đổi vai trò của Owner');
            }

            // Nếu hạ quyền của Owner, phải đảm bảo còn ít nhất 1 Owner khác
            if (targetMember.role === 'Owner' && role !== 'Owner') {
                const ownerCount = org.members.filter(m => m.role === 'Owner').length;
                if (ownerCount <= 1) {
                    throw new AppError(400, 'Không thể hạ quyền Owner cuối cùng. Hãy chỉ định người khác làm Owner trước.');
                }
            }

            if (role) {
                const oldRole = targetMember.role;
                targetMember.role = role;
                org.markModified('members');

                // Đồng bộ role xuống tất cả Workspace thuộc Organization này
                await Workspace.updateMany(
                    { organizationId: org._id, "members.userId": userId },
                    { $set: { "members.$.role": role } }
                );

                // Đồng bộ giáng chức xuống SubTeam nếu role cũ là Leader và role mới không phải Leader
                if (oldRole === 'Leader' && role !== 'Leader') {
                    await SubTeam.updateMany(
                        { organizationId: org._id, "members.userId": userId, "members.role": 'Leader' },
                        { $set: { "members.$.role": 'Member' } }
                    );
                }
                
                // Đồng bộ thăng chức lên SubTeam nếu role mới là Leader
                if (oldRole !== 'Leader' && role === 'Leader') {
                    await SubTeam.updateMany(
                        { organizationId: org._id, "members.userId": userId, "members.role": 'Member' },
                        { $set: { "members.$.role": 'Leader' } }
                    );
                }
            }

            await org.save();

            res.status(200).json({ status: 'success', message: 'Cập nhật thành công' });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    }
};
