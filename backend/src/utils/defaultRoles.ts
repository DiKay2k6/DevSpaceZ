import mongoose from 'mongoose';
import { Role, PERMISSIONS } from '../models/role.model';

export const ensureDefaultRoles = async (organizationId: string) => {
    const existingDev = await Role.findOne({ organizationId, name: 'Developer' });
    if (!existingDev) {
        await Role.create([
            {
                name: 'Developer',
                description: 'Thành viên phát triển: Chỉnh sửa thẻ, cập nhật trạng thái',
                organizationId,
                permissions: ['task:edit', 'task:move', 'board:view', 'document:view', 'document:create', 'document:edit'],
                isSystemDefault: true
            },
            {
                name: 'Leader',
                description: 'Trưởng nhóm: Có quyền của Developer + giao việc, xóa thẻ, quản lý cột',
                organizationId,
                permissions: ['task:create', 'task:edit', 'task:delete', 'task:move', 'task:assign', 'board:view', 'list:create', 'list:edit', 'list:delete', 'document:view', 'document:create', 'document:edit', 'document:delete'],
                isSystemDefault: true
            },
            {
                name: 'Manager',
                description: 'Quản lý: Có toàn quyền điều hành dự án, ngoại trừ việc thay đổi quyền của Owner',
                organizationId,
                permissions: [...PERMISSIONS],
                isSystemDefault: true,
                color: '#3b82f6'
            }
        ]);
    } else {
        // Migration: Đảm bảo các Org cũ cũng có role Manager
        const existingManager = await Role.findOne({ organizationId, name: 'Manager' });
        if (!existingManager) {
            await Role.create({
                name: 'Manager',
                description: 'Quản lý: Có toàn quyền điều hành dự án, ngoại trừ việc thay đổi quyền của Owner',
                organizationId,
                permissions: [...PERMISSIONS],
                isSystemDefault: true,
                color: '#3b82f6'
            });
        }
    }
};
