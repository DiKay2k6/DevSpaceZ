import { Request, Response } from 'express';
import { SubTeam } from '../models/subteam.model';
import { Organization } from '../models/organization.model';
import { Workspace } from '../models/workspace.model';
import { User } from '../models/user.model';
import { AppError } from '../utils/appError';

export const subteamController = {
    // Tạo SubTeam mới
    createSubTeam: async (req: Request, res: Response) => {
        try {
            const { name, description, orgId, userIds } = req.body;
            const userId = (req as any).user.id;

            // Kiểm tra quyền (chỉ Owner/Admin của Org mới được tạo)
            const org = await Organization.findOne({
                _id: orgId,
                members: { $elemMatch: { userId, role: { $in: ['Owner', 'Manager'] } } }
            });

            if (!org) {
                throw new AppError(403, 'Bạn không có quyền tạo phòng ban trong tổ chức này');
            }

            // Tạo danh sách member ban đầu
            const initialMembers: any[] = [{ userId, role: 'Leader' }];
            if (userIds && Array.isArray(userIds)) {
                userIds.forEach((id: string) => {
                    if (id !== userId) {
                        initialMembers.push({ userId: id, role: 'Member' } as any);
                    }
                });
            }

            const newSubTeam = await SubTeam.create({
                name,
                description,
                organizationId: orgId,
                members: initialMembers
            });

            res.status(201).json({
                status: 'success',
                data: { subTeam: newSubTeam }
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    // Lấy danh sách SubTeam của một Organization
    getSubTeamsByOrg: async (req: Request, res: Response) => {
        try {
            const { orgId } = req.params;
            const userId = (req as any).user.id;

            // Kiểm tra user có thuộc Org không
            const org = await Organization.findOne({ _id: orgId, 'members.userId': userId });
            if (!org) {
                throw new AppError(403, 'Bạn không có quyền truy cập tổ chức này');
            }

            const subTeams = await SubTeam.find({ organizationId: orgId })
                .populate('members.userId', 'full_name email avatar_url')
                .lean();

            res.status(200).json({
                status: 'success',
                data: { subTeams }
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    // Xoá SubTeam
    deleteSubTeam: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as any).user.id;

            const subTeam = await SubTeam.findById(id);
            if (!subTeam) throw new AppError(404, 'Không tìm thấy phòng ban');

            // Cần kiểm tra quyền admin tổ chức
            const org = await Organization.findOne({
                _id: subTeam.organizationId,
                members: { $elemMatch: { userId, role: { $in: ['Owner', 'Manager'] } } }
            });

            if (!org) throw new AppError(403, 'Bạn không có quyền xóa phòng ban này');

            await SubTeam.findByIdAndDelete(id);

            res.status(200).json({ status: 'success', message: 'Đã xóa phòng ban' });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    // Cập nhật thông tin SubTeam
    updateSubTeam: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            const userId = (req as any).user.id;

            const subTeam = await SubTeam.findById(id);
            if (!subTeam) throw new AppError(404, 'Không tìm thấy phòng ban');

            // Kiểm tra quyền: Phải là Admin của Org hoặc Leader của SubTeam
            const isLeader = subTeam.members.some(m => m.userId.toString() === userId && m.role === 'Leader');
            if (!isLeader) {
                const org = await Organization.findOne({
                    _id: subTeam.organizationId,
                    members: { $elemMatch: { userId, role: { $in: ['Owner', 'Manager'] } } }
                });
                if (!org) throw new AppError(403, 'Bạn không có quyền chỉnh sửa phòng ban này');
            }

            subTeam.name = name || subTeam.name;
            subTeam.description = description !== undefined ? description : subTeam.description;
            await subTeam.save();

            res.status(200).json({ status: 'success', message: 'Đã cập nhật phòng ban', data: { subTeam } });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    // Thêm member vào SubTeam
    addMembers: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { userIds } = req.body; // mảng các userId
            const currentUserId = (req as any).user.id;

            const subTeam = await SubTeam.findById(id);
            if (!subTeam) throw new AppError(404, 'Không tìm thấy phòng ban');

            // Phải là Admin của Org hoặc Leader của SubTeam
            const isLeader = subTeam.members.some(m => m.userId.toString() === currentUserId && m.role === 'Leader');
            if (!isLeader) {
                const org = await Organization.findOne({
                    _id: subTeam.organizationId,
                    members: { $elemMatch: { userId: currentUserId, role: { $in: ['Owner', 'Manager'] } } }
                });
                if (!org) throw new AppError(403, 'Bạn không có quyền thêm thành viên vào nhóm này');
            }

            // Lọc ra những user chưa có trong subteam
            const newMembers = userIds
                .filter((uid: string) => !subTeam.members.some(m => m.userId.toString() === uid))
                .map((uid: string) => ({ userId: uid, role: 'Member' }));

            if (newMembers.length > 0) {
                subTeam.members.push(...newMembers);
                await subTeam.save();
            }

            res.status(200).json({ status: 'success', message: 'Đã thêm thành viên' });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    // Xóa member khỏi SubTeam
    removeMember: async (req: Request, res: Response) => {
        try {
            const { id, userId } = req.params;
            const currentUserId = (req as any).user.id;

            const subTeam = await SubTeam.findById(id);
            if (!subTeam) throw new AppError(404, 'Không tìm thấy phòng ban');

            const isLeader = subTeam.members.some(m => m.userId.toString() === currentUserId && m.role === 'Leader');
            if (!isLeader && currentUserId !== userId) {
                const org = await Organization.findOne({
                    _id: subTeam.organizationId,
                    members: { $elemMatch: { userId: currentUserId, role: { $in: ['Owner', 'Manager'] } } }
                });
                if (!org) throw new AppError(403, 'Bạn không có quyền xóa thành viên này khỏi nhóm');
            }

            subTeam.members = subTeam.members.filter(m => m.userId.toString() !== userId);
            await subTeam.save();

            res.status(200).json({ status: 'success', message: 'Đã xóa thành viên khỏi nhóm' });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    // Cập nhật role của member trong SubTeam
    updateMemberRole: async (req: Request, res: Response) => {
        try {
            const { id, userId } = req.params;
            const { role, newOrgRole } = req.body; // role: 'Leader' | 'Member', newOrgRole: optional
            const currentUserId = (req as any).user.id;

            if (!['Leader', 'Member'].includes(role)) {
                throw new AppError(400, 'Quyền không hợp lệ');
            }

            const subTeam = await SubTeam.findById(id);
            if (!subTeam) throw new AppError(404, 'Không tìm thấy phòng ban');

            // Người thay đổi phải là Leader hiện tại HOẶC là Admin/Owner của Tổ chức
            const isLeader = subTeam.members.some(m => m.userId.toString() === currentUserId && m.role === 'Leader');
            if (!isLeader) {
                const org = await Organization.findOne({
                    _id: subTeam.organizationId,
                    members: { $elemMatch: { userId: currentUserId, role: { $in: ['Owner', 'Manager'] } } }
                });
                if (!org) throw new AppError(403, 'Bạn không có quyền thay đổi vai trò trong phòng ban này');
            }

            const memberIndex = subTeam.members.findIndex(m => m.userId.toString() === userId);
            if (memberIndex === -1) {
                throw new AppError(404, 'Thành viên không thuộc phòng ban này');
            }

            const oldRole = subTeam.members[memberIndex].role;
            subTeam.members[memberIndex].role = role;
            await subTeam.save();

            // Đồng bộ lên Organization và Workspace
            if (role === 'Leader' && oldRole !== 'Leader') {
                // Thăng chức: Tự động đổi thành Leader trên Org
                await Organization.updateOne(
                    { _id: subTeam.organizationId, "members.userId": userId },
                    { $set: { "members.$.role": 'Leader' } }
                );
                await Workspace.updateMany(
                    { organizationId: subTeam.organizationId, "members.userId": userId },
                    { $set: { "members.$.role": 'Leader' } }
                );
            } else if (role === 'Member' && oldRole === 'Leader') {
                // Giáng chức: Sử dụng newOrgRole (mặc định Developer)
                const fallbackRole = newOrgRole || 'Developer';
                await Organization.updateOne(
                    { _id: subTeam.organizationId, "members.userId": userId },
                    { $set: { "members.$.role": fallbackRole } }
                );
                await Workspace.updateMany(
                    { organizationId: subTeam.organizationId, "members.userId": userId },
                    { $set: { "members.$.role": fallbackRole } }
                );
            }

            res.status(200).json({ status: 'success', message: 'Đã thay đổi vai trò thành viên' });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    }
};
