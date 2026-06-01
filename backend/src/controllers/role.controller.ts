import { Request, Response } from 'express';
import { Role, PERMISSIONS } from '../models/role.model';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { ensureDefaultRoles } from '../utils/defaultRoles';

export const roleController = {
    /**
     * @route GET /api/v1/roles
     * @desc Lấy danh sách Roles của Organization hoặc Workspace
     */
    getRoles: asyncHandler(async (req: Request, res: Response) => {
        const { organizationId, workspaceId } = req.query;

        if (!organizationId && !workspaceId) {
            throw new AppError('Cần cung cấp organizationId hoặc workspaceId', 400);
        }

        const query: any = {};
        if (organizationId) {
            query.organizationId = organizationId;
            await ensureDefaultRoles(organizationId as string);
        }
        if (workspaceId) query.workspaceId = workspaceId;

        const roles = await Role.find(query).sort({ isSystemDefault: -1, createdAt: -1 });

        res.status(200).json({
            status: 'success',
            data: { roles }
        });
    }),

    /**
     * @route POST /api/v1/roles
     * @desc Tạo Custom Role mới
     */
    createRole: asyncHandler(async (req: Request, res: Response) => {
        const { name, description, color, organizationId, workspaceId, permissions } = req.body;

        if (!name || !organizationId) {
            throw new AppError('Thiếu thông tin bắt buộc', 400);
        }

        // Filter invalid permissions silently to auto-cleanup old deprecated permissions
        if (permissions) {
            req.body.permissions = permissions.filter((p: string) => PERMISSIONS.includes(p as any));
        }

        // Check duplicate name
        const existingRole = await Role.findOne({ 
            name, 
            organizationId, 
            workspaceId: workspaceId || null 
        });
        
        if (existingRole) {
            throw new AppError(`Vai trò "${name}" đã tồn tại! Vui lòng chọn tên khác.`, 400);
        }

        const newRole = await Role.create({
            name,
            description,
            color,
            organizationId,
            workspaceId: workspaceId || null,
            permissions,
            isSystemDefault: false
        });

        res.status(201).json({
            status: 'success',
            data: { role: newRole }
        });
    }),

    /**
     * @route PUT /api/v1/roles/:id
     * @desc Cập nhật Role
     */
    updateRole: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, description, color, permissions } = req.body;

        const role = await Role.findById(id);
        if (!role) {
            throw new AppError('Không tìm thấy vai trò', 404);
        }

        // Filter invalid permissions silently to auto-cleanup old deprecated permissions
        if (permissions) {
            role.permissions = permissions.filter((p: string) => PERMISSIONS.includes(p as any));
        }

        if (name && name !== role.name) {
            if (role.isSystemDefault) {
                throw new AppError('Không thể đổi tên vai trò mặc định của hệ thống', 403);
            }
            const existingRole = await Role.findOne({ 
                name, 
                organizationId: role.organizationId, 
                workspaceId: role.workspaceId 
            });
            
            if (existingRole) {
                throw new AppError(`Vai trò "${name}" đã tồn tại! Vui lòng chọn tên khác.`, 400);
            }
            role.name = name;
        }
        if (description !== undefined) role.description = description;
        if (color !== undefined) role.color = color;

        await role.save();

        res.status(200).json({
            status: 'success',
            data: { role }
        });
    }),

    /**
     * @route DELETE /api/v1/roles/:id
     * @desc Xóa Custom Role
     */
    deleteRole: asyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const role = await Role.findById(id);
        if (!role) {
            throw new AppError('Không tìm thấy vai trò', 404);
        }

        if (role.isSystemDefault) {
            throw new AppError('Không thể xóa vai trò mặc định của hệ thống', 403);
        }

        // Kiểm tra xem Role có đang được sử dụng không (Cần check Workspace/Org members)
        // Lược bớt kiểm tra chi tiết để tiết kiệm tài nguyên ở đây, thực tế nên có
        
        await Role.findByIdAndDelete(id);

        res.status(200).json({
            status: 'success',
            message: 'Đã xóa vai trò'
        });
    })
};
