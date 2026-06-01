import { Request, Response } from 'express';
import { getIO } from '../utils/socket';
import { Board } from '../models/board.model';
import { List } from '../models/list.model';
import { Task } from '../models/task.model';
import { AppError } from '../utils/appError';
import { Workspace } from '../models/workspace.model';
import { Activity } from '../models/activity.model';
import { Organization } from '../models/organization.model';
import mongoose from 'mongoose';
import { cacheService } from '../services/cache.service';

export const boardController = {
    /**
     * @route POST /api/v1/boards
     * @desc Tạo một bảng Kanban mới (Và tự động tạo 3 cột cơ bản)
     * @access Private
     */
    createBoard: async (req: Request, res: Response) => {
        try {
            const { title, description, orgId, enableCloud } = req.body;
            const userId = (req as any).user.id;

            const generateProjectKey = (name: string) => {
                const words = name.split(' ');
                let key = words.map(w => w[0]).join('').substring(0, 4).toUpperCase();
                if (!key) key = 'PRJ';
                return `${key}-${Math.floor(1000 + Math.random() * 9000)}`;
            };

            if (orgId) {
                const organization = await Organization.findById(orgId);
                if (!organization) throw new AppError('Không tìm thấy tổ chức', 404);
                
                const member = organization.members.find(m => m.userId.toString() === userId);
                if (!member) throw new AppError('Bạn không thuộc tổ chức này', 403);
                
                if (member.role !== 'Owner' && member.role !== 'Manager') {
                    const RoleModel = mongoose.model('Role');
                    const roleDoc = await RoleModel.findOne({ organizationId: orgId, name: member.role }).lean() as any;
                    if (!roleDoc || !roleDoc.permissions.includes('board:create')) {
                        throw new AppError('Bạn không có quyền tạo dự án trong tổ chức này', 403);
                    }
                }
            }

            const workspace = await Workspace.create({
                name: `${title}`,
                projectKey: generateProjectKey(title),
                organizationId: orgId,
                ownerId: userId,
                isCloud: enableCloud === true,
                members: [{ userId: userId, role: 'Manager', obsTitle: 'Project Manager' }]
            });

            if (enableCloud) {
                const File = mongoose.model('File');
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
            }

            // 2. Tạo Bảng Kanban mới
            const newBoard = await Board.create({
                title,
                description,
                workspaceId: workspace._id,
                ownerId: userId
            });

            // 3. Tự động sinh ra 4 Cột (List) chuẩn SDLC cho Bảng mới
            const defaultLists = [
                { title: 'Cần làm (To Do)', boardId: newBoard._id, order: 0 },
                { title: 'Đang làm (In Progress)', boardId: newBoard._id, order: 1 },
                { title: 'Kiểm thử (Review/Testing)', boardId: newBoard._id, order: 2 },
                { title: 'Hoàn thành (Done)', boardId: newBoard._id, order: 3 }
            ];
            
            await List.insertMany(defaultLists);

            // 4. Log Activity
            await Activity.create({
                workspaceId: workspace._id,
                userId: userId,
                action: 'tạo',
                targetName: `Dự án "${title}"`,
                targetType: 'Board'
            });

            // Xóa cache danh sách workspace của user
            await cacheService.del(`user_workspaces_${userId}_org_${orgId || 'undefined'}`);

            // Xóa cache thống kê
            await cacheService.delByPattern('dashboard:metrics:*');
            await cacheService.delByPattern('analytics:overview:*');

            res.status(201).json({
                status: 'success',
                message: 'Tạo dự án thành công!',
                data: {
                    board: newBoard
                }
            });

        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({
                status: 'error',
                message: error.message || 'Lỗi hệ thống khi tạo Bảng'
            });
        }
    },

    /**
     * @route GET /api/v1/boards/:id
     * @desc Lấy thông tin chi tiết một bảng Kanban (Bao gồm các List và Task bên trong)
     * @access Private
     */
    getBoardDetails: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as any).user.id; // Lấy từ middleware auth

            // 1. Kiểm tra xem Board có tồn tại không
            const board = await Board.findById(id).lean();
            if (!board) {
                throw new AppError(404, 'Không tìm thấy Bảng Kanban');
            }

            // Lấy thông tin Workspace kèm danh sách thành viên
            const workspace = await Workspace.findById(board.workspaceId)
                .populate('members.userId', '_id full_name avatar_url email')
                .populate({
                    path: 'subTeamIds',
                    populate: {
                        path: 'members.userId',
                        select: '_id full_name avatar_url email'
                    }
                })
                .lean();

            if (!workspace) {
                throw new AppError(404, 'Không tìm thấy Workspace của Bảng Kanban này');
            }

            // Kiểm tra phân quyền: User là owner, hoặc trong members, hoặc trong subTeams
            const isOwner = board.ownerId.toString() === userId;
            const isMember = workspace.members.some((m: any) => m.userId?._id?.toString() === userId || m.userId?.toString() === userId);
            const isInSubTeam = workspace.subTeamIds?.some((team: any) => 
                team.members?.some((m: any) => m.userId?._id?.toString() === userId || m.userId?.toString() === userId)
            );

            if (!isOwner && !isMember && !isInSubTeam) {
                throw new AppError(403, 'Bạn không có quyền truy cập Bảng Kanban này');
            }



            // Gộp members từ subTeamIds vào workspace.members để hiện ở Assignees
            let userIsManagerOrOwner = isOwner;
            const directMember = workspace.members.find((m: any) => m.userId?._id?.toString() === userId || m.userId?.toString() === userId);
            if (directMember && directMember.role === 'Manager') {
                userIsManagerOrOwner = true;
            }

            let userLeaderOfSubTeamIds = new Set<string>(); // Lưu các SubTeam mà user làm Leader
            let userMemberOfSubTeamIds = new Set<string>(); // Lưu các SubTeam mà user làm Member

            if (workspace && workspace.subTeamIds) {
                const org = workspace.organizationId ? await Organization.findById(workspace.organizationId).lean() : null;
                const getOrgRole = (uId: string) => {
                    const m = org?.members?.find((om: any) => om.userId.toString() === uId);
                    return m?.role || 'Developer';
                };

                // Xác định user là Leader hay Member ở các SubTeam nào
                workspace.subTeamIds.forEach((team: any) => {
                    const m = team.members?.find((m: any) => m.userId?._id?.toString() === userId || m.userId?.toString() === userId);
                    if (m) {
                        if (m.role === 'Leader') userLeaderOfSubTeamIds.add(team._id.toString());
                        else userMemberOfSubTeamIds.add(team._id.toString());
                    }
                });

                const subTeamMembers = workspace.subTeamIds.flatMap((team: any) => team.members || []);
                subTeamMembers.forEach((teamMember: any) => {
                    if (!teamMember.userId) return;
                    
                    const teamUserIdStr = teamMember.userId?._id?.toString() || teamMember.userId?.toString();
                    const existingMember = workspace.members.find((m: any) => 
                        (m.userId?._id?.toString() || m.userId?.toString()) === teamUserIdStr
                    );
                    
                    if (!existingMember) {
                        workspace.members.push({
                            userId: teamMember.userId,
                            role: teamMember.role === 'Leader' ? 'Leader' : getOrgRole(teamUserIdStr),
                            subTeamId: teamMember.subTeamId 
                        } as any);
                    }
                });
            }

            // Lọc danh sách hiển thị Assignees (workspace.members)
            if (!userIsManagerOrOwner) {
                if (userLeaderOfSubTeamIds.size > 0) {
                    // Nếu là Leader, chỉ lấy những người thuộc phòng ban mà mình làm Leader, và bản thân mình
                    const allowedUserIds = new Set<string>();
                    allowedUserIds.add(userId);
                    
                    workspace.subTeamIds?.forEach((team: any) => {
                        if (userLeaderOfSubTeamIds.has(team._id.toString())) {
                            team.members?.forEach((m: any) => {
                                const id = m.userId?._id?.toString() || m.userId?.toString();
                                if (id) allowedUserIds.add(id);
                            });
                        }
                    });

                    workspace.members = workspace.members.filter((m: any) => {
                        const id = m.userId?._id?.toString() || m.userId?.toString();
                        return allowedUserIds.has(id);
                    });
                } else {
                    // Nếu chỉ là Member bình thường, chỉ thấy chính mình
                    workspace.members = workspace.members.filter((m: any) => {
                        const id = m.userId?._id?.toString() || m.userId?.toString();
                        return id === userId;
                    });
                }
            }

            // Format workspace to match expected frontend structure for Board, but keep the role!
            if (workspace && workspace.members) {
                workspace.members = workspace.members.map((m: any) => m.userId ? { ...m.userId, role: m.role } : m) as any;
            }

            // 2. Lấy toàn bộ Lists thuộc về Board này, sắp xếp theo Order
            const lists = await List.find({ boardId: id }).sort({ order: 1 }).lean();

            // 3. Lấy toàn bộ Tasks thuộc về Board này và populate assignees
            const tasks = await Task.find({ boardId: id })
                .sort({ order: 1 })
                .populate('assignees', '_id full_name avatar_url email')
                .lean();

            // 4. Ghép Tasks vào từng List tương ứng (Tối ưu O(n) thay vì O(n^2))
            const taskMap = tasks.reduce((acc, task) => {
                const listIdStr = task.listId.toString();
                if (!acc[listIdStr]) {
                    acc[listIdStr] = [];
                }
                acc[listIdStr].push(task);
                return acc;
            }, {} as Record<string, typeof tasks>);

            const listsWithTasks = lists.map(list => ({
                ...list,
                tasks: taskMap[list._id.toString()] || []
            }));

            // 5. Trả về cấu trúc DTO hoàn chỉnh cho Frontend dễ dàng render
            res.status(200).json({
                status: 'success',
                data: {
                    board: {
                        ...board,
                        lists: listsWithTasks
                    },
                    workspace
                }
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({
                status: 'error',
                message: error.message || 'Lỗi hệ thống'
            });
        }
    },

    /**
     * @route GET /api/v1/boards
     * @desc Lấy danh sách tất cả các bảng Kanban của user
     * @access Private
     */
    getAllBoards: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const orgId = req.query.orgId as string;
            
            let workspaceIds: any[] = [];
            
            if (orgId && orgId !== 'undefined' && orgId !== 'null') {
                // Kiểm tra role của user trong Org
                const org = await mongoose.model('Organization').findById(orgId).lean() as any;
                if (!org) throw new AppError(404, 'Không tìm thấy tổ chức');
                
                const userInOrg = org.members.find((m: any) => m.userId.toString() === userId);
                if (!userInOrg) throw new AppError(403, 'Bạn không thuộc tổ chức này');
                
                if (userInOrg.role === 'Owner' || userInOrg.role === 'Manager') {
                    // Chủ hoặc Quản trị viên thấy tất cả dự án trong tổ chức
                    const workspaces = await Workspace.find({ organizationId: orgId }).lean();
                    workspaceIds = workspaces.map(w => w._id);
                } else {
                    // Member bình thường chỉ thấy dự án có mình tham gia trực tiếp
                    // Hoặc dự án có chứa phòng ban mà member đó tham gia
                    const SubTeam = mongoose.model('SubTeam');
                    const userSubTeams = await SubTeam.find({
                        organizationId: orgId,
                        'members.userId': userId
                    }).lean();
                    const userSubTeamIds = userSubTeams.map(t => t._id);

                    const workspaces = await Workspace.find({ 
                        organizationId: orgId,
                        $or: [
                            { 'members.userId': userId },
                            { subTeamIds: { $in: userSubTeamIds } }
                        ]
                    }).lean();
                    workspaceIds = workspaces.map(w => w._id);
                }
            } else {
                const workspaces = await Workspace.find({ 
                    'members.userId': userId,
                    organizationId: { $exists: false }
                }).lean();
                workspaceIds = workspaces.map(w => w._id);
            }

            const boards = await Board.find({ workspaceId: { $in: workspaceIds } }).populate("workspaceId", "organizationId").sort({ updatedAt: -1 }).lean();
            
            res.status(200).json({
                status: 'success',
                data: { boards }
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message || 'Lỗi hệ thống' });
        }
    },

    /**
     * @route PUT /api/v1/boards/:id
     * @desc Cập nhật thông tin bảng (vd: đổi hình nền)
     * @access Private
     */
    updateBoard: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Không cho phép sửa ownerId
            delete updateData.ownerId;

            const updatedBoard = await Board.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true, runValidators: true }
            );

            if (!updatedBoard) {
                throw new AppError(404, 'Không tìm thấy bảng công việc');
            }
            
            getIO().to(id.toString()).emit('board_updated', { action: 'update_board' });

            res.status(200).json({
                status: 'success',
                data: {
                    board: updatedBoard
                }
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({
                status: 'error',
                message: error.message || 'Lỗi khi cập nhật bảng'
            });
        }
    },

    /**
     * @route DELETE /api/v1/boards/:id
     * @desc Xóa bảng và toàn bộ danh sách, thẻ thuộc về bảng đó
     * @access Private
     */
    deleteBoard: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const board = await Board.findById(id);
            if (!board) {
                throw new AppError(404, 'Không tìm thấy bảng công việc');
            }

            // Xoá dây chuyền (Cascading Delete)
            await Task.deleteMany({ boardId: id }); // Xóa tất cả các thẻ của board
            await List.deleteMany({ boardId: id }); // Xóa tất cả các cột của board
            await Board.findByIdAndDelete(id);      // Cuối cùng xóa board

            // Xóa cache thống kê
            await cacheService.delByPattern('dashboard:metrics:*');
            await cacheService.delByPattern('analytics:overview:*');

            res.status(200).json({
                status: 'success',
                message: 'Đã xóa bảng và toàn bộ dữ liệu liên quan'
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({
                status: 'error',
                message: error.message || 'Lỗi hệ thống khi xóa bảng'
            });
        }
    }
};
