import { Request, Response } from 'express';
import { Workspace } from '../models/workspace.model';
import { Board } from '../models/board.model';
import { Task } from '../models/task.model';
import { AppError } from '../utils/appError';
import mongoose from 'mongoose';
import { cacheService } from '../services/cache.service';

export const dashboardController = {
    /**
     * @route GET /api/v1/workspaces/:id/metrics
     * @desc Lấy số liệu báo cáo của Workspace (Tổng quan, Phân bổ Task, Burndown)
     */
    getDashboardMetrics: async (req: Request, res: Response) => {
        try {
            const orgId = req.query.orgId as string;
            const userId = (req as any).user.id;

            // Kiểm tra cache trước
            const cacheKey = `dashboard:metrics:${userId.toString()}:${orgId || 'personal'}`;
            const cachedData = await cacheService.get(cacheKey);
            if (cachedData) {
                return res.status(200).json(cachedData);
            }

            // 1. Tìm các Workspaces phù hợp (Tổ chức hoặc Cá nhân)
            let workspaces;
            if (orgId) {
                // Kiểm tra role của user trong Org
                const org = await mongoose.model('Organization').findById(orgId).lean() as any;
                if (!org) throw new AppError(404, 'Không tìm thấy tổ chức');
                
                const userInOrg = org.members.find((m: any) => m.userId.toString() === userId);
                if (!userInOrg) throw new AppError(403, 'Bạn không thuộc tổ chức này');
                
                if (userInOrg.role === 'Owner' || userInOrg.role === 'Manager') {
                    // Chủ hoặc Quản trị viên thấy tất cả dự án trong tổ chức
                    workspaces = await Workspace.find({ organizationId: orgId }).lean();
                } else {
                    // Member bình thường chỉ thấy dự án có mình tham gia trực tiếp
                    // Hoặc dự án có chứa phòng ban mà member đó tham gia
                    const SubTeam = mongoose.model('SubTeam');
                    const userSubTeams = await SubTeam.find({
                        organizationId: orgId,
                        'members.userId': userId
                    }).lean();
                    const userSubTeamIds = userSubTeams.map(t => t._id);

                    workspaces = await Workspace.find({ 
                        organizationId: orgId,
                        $or: [
                            { 'members.userId': userId },
                            { subTeamIds: { $in: userSubTeamIds } }
                        ]
                    }).lean();
                }
            } else {
                workspaces = await Workspace.find({ 
                    'members.userId': userId,
                    organizationId: { $exists: false }
                }).lean();
            }

            const workspaceIds = workspaces.map(w => w._id);

            // 2. Lấy danh sách Boards trong các Workspaces đó
            const boards = await Board.find({ workspaceId: { $in: workspaceIds } }).lean();
            const boardIds = boards.map(b => b._id);

            // 3. Lấy tất cả Tasks của các Boards đó
            const tasks = await Task.find({ boardId: { $in: boardIds } }).lean();

            // --- Tính toán Metrics Tổng quan ---
            // Tổng thành viên: Lấy tập hợp unique users từ tất cả workspaces tìm được
            const uniqueMembers = new Set<string>();
            workspaces.forEach(w => {
                if (w.members) {
                    w.members.forEach(m => {
                        if (m.userId) uniqueMembers.add(m.userId.toString());
                    });
                }
            });
            const totalMembers = uniqueMembers.size;
            const activeBoardsCount = boards.length;

            // Tính số Task hoàn thành tuần này
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Thứ Hai
            startOfWeek.setHours(0, 0, 0, 0);

            let completedTasksThisWeek = 0;
            const statusDistribution: Record<string, number> = {
                'To Do': 0,
                'In Progress': 0,
                'Review': 0,
                'Done': 0
            };

            // Dữ liệu cho Burndown Chart (14 ngày gần nhất)
            const last14Days = Array.from({ length: 14 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (13 - i));
                return {
                    date: d.toISOString().split('T')[0],
                    totalPoints: 0,
                    remainingPoints: 0,
                    completedPoints: 0
                };
            });

            let totalWorkspacePoints = 0;

            tasks.forEach(task => {
                const status = task.status || 'To Do';
                const points = task.storyPoints || 0;
                totalWorkspacePoints += points;

                // Cập nhật phân bổ trạng thái
                if (statusDistribution[status] !== undefined) {
                    statusDistribution[status]++;
                } else {
                    statusDistribution[status] = 1;
                }

                // Cập nhật số task hoàn thành trong tuần
                if (status === 'Done') {
                    const updatedDate = new Date(task.updatedAt);
                    if (updatedDate >= startOfWeek) {
                        completedTasksThisWeek++;
                    }
                }
            });

            // Mô phỏng dữ liệu Burndown
            last14Days.forEach(dayInfo => {
                dayInfo.totalPoints = totalWorkspacePoints;
                
                let completedUntilThisDay = 0;
                tasks.forEach(task => {
                    if (task.status === 'Done') {
                        const doneDate = new Date(task.updatedAt).toISOString().split('T')[0];
                        if (doneDate <= dayInfo.date) {
                            completedUntilThisDay += (task.storyPoints || 0);
                        }
                    }
                });
                
                dayInfo.completedPoints = completedUntilThisDay;
                dayInfo.remainingPoints = totalWorkspacePoints - completedUntilThisDay;
            });

            const statusPieData = Object.keys(statusDistribution).map(key => ({
                name: key,
                value: statusDistribution[key]
            }));

            const responseData = {
                status: 'success',
                data: {
                    overview: {
                        totalMembers,
                        activeBoardsCount,
                        completedTasksThisWeek
                    },
                    statusDistribution: statusPieData,
                    burndownData: last14Days
                }
            };

            // Lưu vào cache (TTL: 1 giờ)
            await cacheService.set(cacheKey, responseData, 3600);

            res.status(200).json(responseData);

        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    }
};
