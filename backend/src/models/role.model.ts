import mongoose, { Schema, Document } from 'mongoose';

export const PERMISSIONS = [
    // Quản lý Board & List
    'board:create', 'board:edit', 'board:delete', 'board:view',
    'list:create', 'list:edit', 'list:delete',
    
    // Quản lý Task
    'task:create', 'task:edit', 'task:delete', 'task:move', 'task:assign',
    
    // Quản lý Member
    'member:invite', 'member:remove', 'member:change_role',
    
    // Tính năng mở rộng
    'document:create', 'document:edit', 'document:delete', 'document:view',
    'analytics:view'
] as const;

export type Permission = typeof PERMISSIONS[number];

export interface IRole extends Document {
    name: string;
    description?: string;
    color?: string;
    organizationId: mongoose.Types.ObjectId;
    workspaceId?: mongoose.Types.ObjectId; // Nếu Role dành riêng cho 1 Workspace. Nếu null => Role dùng chung cho toàn Org.
    permissions: Permission[];
    isSystemDefault: boolean; // VD: Admin, Member (không được phép xóa)
    createdAt: Date;
    updatedAt: Date;
}

const RoleSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên vai trò là bắt buộc'],
            trim: true,
            maxlength: [50, 'Tên vai trò không vượt quá 50 ký tự']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Mô tả không vượt quá 200 ký tự']
        },
        color: {
            type: String,
            default: '#94a3b8' // Màu xám mặc định
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true
        },
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: 'Workspace'
        },
        permissions: [{
            type: String,
            enum: PERMISSIONS
        }],
        isSystemDefault: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Tránh trùng tên role trong cùng 1 workspace/org
RoleSchema.index({ name: 1, organizationId: 1, workspaceId: 1 }, { unique: true });

export const Role = mongoose.model<IRole>('Role', RoleSchema);
