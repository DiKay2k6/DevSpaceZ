import { Request, Response } from 'express';
import { Board } from '../models/board.model';
import { Task } from '../models/task.model';
import { SubTeam } from '../models/subteam.model';
import { Workspace } from '../models/workspace.model';
import { Organization } from '../models/organization.model';
import mongoose from 'mongoose';
import { cacheService } from '../services/cache.service';

async function getAccessibleWorkspaceIds(userId: mongoose.Types.ObjectId, orgId?: any) {
    if (!orgId || orgId === 'undefined' || orgId === 'null' || orgId === 'all') {
        const workspaces = await Workspace.find({ ownerId: userId, organizationId: { $exists: false } }).select('_id').lean();
        return workspaces.map(ws => ws._id);
    }

    const org = await Organization.findById(orgId).lean();
    if (!org) return [];

    const member = org.members.find(m => m.userId.toString() === userId.toString());
    if (!member) return [];

    if (member.role === 'Owner' || member.role === 'Manager') {
        const workspaces = await Workspace.find({ organizationId: orgId }).select('_id').lean();
        return workspaces.map(ws => ws._id);
    } else {
        const subTeams = await SubTeam.find({ organizationId: orgId, 'members.userId': userId }).select('_id').lean();
        const subTeamIds = subTeams.map(t => t._id);
        const workspaces = await Workspace.find({
            organizationId: orgId,
            $or: [
                { ownerId: userId },
                { 'members.userId': userId },
                { subTeamIds: { $in: subTeamIds } }
            ]
        }).select('_id').lean();
        return workspaces.map(ws => ws._id);
    }
}

export const analyticsController = {
    /**
     * @route GET /api/v1/analytics/overview
     * @desc Lấy dữ liệu thống kê tổng quan của User
     * @access Private
     */
    getOverviewMetrics: async (req: Request, res: Response) => {
        try {
            const userId = new mongoose.Types.ObjectId((req as any).user.id);
            const { orgId } = req.query;
            
            // Lấy từ Cache trước
            const cacheKey = `analytics:overview:${userId.toString()}:${orgId || 'personal'}`;
            const cachedData = await cacheService.get(cacheKey);
            if (cachedData) {
                return res.status(200).json(cachedData);
            }

            const workspaceIds = await getAccessibleWorkspaceIds(userId, orgId);

            const boards = await Board.find({ workspaceId: { $in: workspaceIds } }).select('_id title').lean();
            const boardIds = boards.map(b => b._id);

            const tasks = await Task.find({ boardId: { $in: boardIds } }).lean();

            const totalBoards = boards.length;
            const totalTasks = tasks.length;
            const myTasksCount = tasks.filter(t => t.assignees?.some(a => a?.toString() === userId.toString())).length;

            const doneTasksCount = tasks.filter(t => t.status === 'Done').length;
            const performance = totalTasks > 0 ? Math.round((doneTasksCount / totalTasks) * 100) : 0;
            
            const now = new Date();
            const overdueTasksCount = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done').length;

            const priorityDistribution = [
                { name: 'Cao', value: tasks.filter(t => t.priority === 'High').length, color: '#ef4444' },
                { name: 'Trung bình', value: tasks.filter(t => t.priority === 'Medium').length, color: '#eab308' },
                { name: 'Thấp', value: tasks.filter(t => t.priority === 'Low').length, color: '#22c55e' }
            ].filter(p => p.value > 0);

            const tasksByBoard = boards.map(board => {
                const count = tasks.filter(t => t.boardId?.toString() === board._id.toString()).length;
                return {
                    name: board.title,
                    tasks: count
                };
            }).filter(b => b.tasks > 0);

            const responseData = {
                status: 'success',
                data: {
                    summary: {
                        totalBoards,
                        totalTasks,
                        myTasksCount,
                        performance,
                        overdueTasksCount
                    },
                    charts: {
                        priorityDistribution: priorityDistribution.length > 0 ? priorityDistribution : [{ name: 'Chưa có', value: 1, color: '#cbd5e1' }],
                        tasksByBoard
                    }
                }
            };

            // Lưu vào Cache (1 giờ = 3600 giây)
            await cacheService.set(cacheKey, responseData, 3600);

            res.status(200).json(responseData);
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route GET /api/v1/analytics/projects
     * @desc Thống kê dữ liệu theo Dự án (Boards)
     */
    getProjectMetrics: async (req: Request, res: Response) => {
        try {
            const userId = new mongoose.Types.ObjectId((req as any).user.id);
            const { boardId, orgId } = req.query;

            const workspaceIds = await getAccessibleWorkspaceIds(userId, orgId);

            // Tìm boards thuộc các Workspace trên
            let boardQuery: any = { workspaceId: { $in: workspaceIds } };
            
            const boards = await Board.find(boardQuery).select('_id title').lean(); 
            
            let filteredBoardIds = boards.map(b => b._id);
            if (boardId && boardId !== 'all') {
                filteredBoardIds = [new mongoose.Types.ObjectId(boardId as string)];
            }

            // Populate assignees để đếm
            const tasks = await Task.find({ boardId: { $in: filteredBoardIds } }).populate('assignees', 'full_name avatar_url').lean();

            const statusDistribution = [
                { name: 'Chưa bắt đầu', value: tasks.filter(t => t.status === 'Not Started').length, color: '#94a3b8' },
                { name: 'Đang làm', value: tasks.filter(t => t.status === 'In Progress').length, color: '#3b82f6' },
                { name: 'Đang chờ duyệt', value: tasks.filter(t => t.status === 'Review').length, color: '#a855f7' },
                { name: 'Đã hoàn thành', value: tasks.filter(t => t.status === 'Done').length, color: '#22c55e' }
            ].filter(s => s.value > 0);

            const typeDistribution = [
                { name: 'Task', value: tasks.filter(t => t.type === 'Task').length, color: '#3b82f6' },
                { name: 'Feature', value: tasks.filter(t => t.type === 'Feature').length, color: '#10b981' },
                { name: 'Bug', value: tasks.filter(t => t.type === 'Bug').length, color: '#ef4444' },
                { name: 'Chore', value: tasks.filter(t => t.type === 'Chore').length, color: '#f59e0b' },
                { name: 'Epic', value: tasks.filter(t => t.type === 'Epic').length, color: '#8b5cf6' }
            ].filter(t => t.value > 0);

            // Phân bổ Assignee
            const assigneeMap = new Map();
            tasks.forEach(t => {
                if (t.assignees && t.assignees.length > 0) {
                    t.assignees.forEach((a: any) => {
                        if (a && a._id) {
                            const idStr = a._id.toString();
                            if (!assigneeMap.has(idStr)) {
                                assigneeMap.set(idStr, { name: a.full_name, value: 0 });
                            }
                            assigneeMap.get(idStr).value += 1;
                        }
                    });
                } else {
                    if (!assigneeMap.has('unassigned')) {
                        assigneeMap.set('unassigned', { name: 'Chưa giao', value: 0, color: '#cbd5e1' });
                    }
                    assigneeMap.get('unassigned').value += 1;
                }
            });
            const assigneeDistribution = Array.from(assigneeMap.values()).sort((a, b) => b.value - a.value);

            // Assign random color if not set
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
            assigneeDistribution.forEach((a, i) => {
                if (!a.color) a.color = colors[i % colors.length];
            });

            res.status(200).json({
                status: 'success',
                data: {
                    boards,
                    charts: {
                        statusDistribution: statusDistribution.length > 0 ? statusDistribution : [{ name: 'Trống', value: 1, color: '#cbd5e1' }],
                        typeDistribution: typeDistribution.length > 0 ? typeDistribution : [{ name: 'Trống', value: 1, color: '#cbd5e1' }],
                        assigneeDistribution: assigneeDistribution.length > 0 ? assigneeDistribution : [{ name: 'Trống', value: 1, color: '#cbd5e1' }]
                    }
                }
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route GET /api/v1/analytics/teams
     * @desc Thống kê Khối lượng công việc theo phòng ban
     */
    getTeamMetrics: async (req: Request, res: Response) => {
        try {
            const userId = new mongoose.Types.ObjectId((req as any).user.id);
            const { teamId, orgId } = req.query;

            if (!orgId || orgId === 'undefined' || orgId === 'null') {
                return res.status(200).json({ status: 'success', data: { subTeams: [], charts: { workload: [] }, completionRate: 0 } });
            }

            const org = await Organization.findById(orgId).lean();
            if (!org) {
                return res.status(200).json({ status: 'success', data: { subTeams: [], charts: { workload: [] }, completionRate: 0 } });
            }

            const member = org.members.find(m => m.userId.toString() === userId.toString());
            if (!member) {
                return res.status(200).json({ status: 'success', data: { subTeams: [], charts: { workload: [] }, completionRate: 0 } });
            }

            let subTeamQuery: any = { organizationId: new mongoose.Types.ObjectId(orgId as string) };
            if (member.role !== 'Owner' && member.role !== 'Manager') {
                subTeamQuery['members.userId'] = userId;
            }

            const allSubTeams = await SubTeam.find(subTeamQuery).populate('members.userId', 'full_name email avatar_url').lean();
            
            if (!allSubTeams || allSubTeams.length === 0) {
                return res.status(200).json({ status: 'success', data: { subTeams: [], charts: { workload: [] }, completionRate: 0 } });
            }

            let targetTeams = allSubTeams;
            if (teamId && teamId !== 'all') {
                targetTeams = allSubTeams.filter(t => t._id.toString() === teamId);
            }

            // Gộp danh sách user ID
            const memberMap = new Map();
            targetTeams.forEach(st => {
                st.members.forEach((m: any) => {
                    if (m.userId) {
                        memberMap.set(m.userId._id.toString(), m.userId);
                    }
                });
            });
            const memberIds = Array.from(memberMap.keys()).map(id => new mongoose.Types.ObjectId(id));

            // Lấy tất cả Tasks của các member này (bất kể status)
            const allTasks = await Task.find({ 
                assignees: { $in: memberIds }
            }).lean();

            let totalTeamTasks = allTasks.length;
            let doneTeamTasks = allTasks.filter(t => t.status === 'Done').length;
            const completionRate = totalTeamTasks > 0 ? Math.round((doneTeamTasks / totalTeamTasks) * 100) : 0;

            const workload = Array.from(memberMap.values()).map((user: any) => {
                const userTasks = allTasks.filter(t => t.assignees?.some(a => a?.toString() === user._id.toString()));
                const doneTasks = userTasks.filter(t => t.status === 'Done').length;
                const inProgressTasks = userTasks.length - doneTasks;
                return {
                    name: user.full_name,
                    doneTasks,
                    inProgressTasks,
                    totalTasks: userTasks.length,
                    avatar: user.avatar_url
                };
            }).filter(w => w.totalTasks > 0).sort((a, b) => b.totalTasks - a.totalTasks);

            res.status(200).json({
                status: 'success',
                data: {
                    subTeams: allSubTeams, // Để dropdown
                    completionRate,
                    charts: {
                        workload
                    }
                }
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    }
};
