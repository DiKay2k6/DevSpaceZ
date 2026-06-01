import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspaceMember {
    userId: mongoose.Types.ObjectId;
    role: string; // Đổi thành string để hỗ trợ Custom Roles thay vì enum cứng
    obsTitle?: string;
    isBlockedFromIDE?: boolean;
}

export interface IWorkspace extends Document {
    name: string;
    projectKey: string;
    description?: string;
    isCloud: boolean;
    organizationId?: mongoose.Types.ObjectId;
    subTeamIds?: mongoose.Types.ObjectId[];
    ownerId: mongoose.Types.ObjectId;
    members: IWorkspaceMember[];
    createdAt: Date;
    updatedAt: Date;
}

const WorkspaceSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên không gian làm việc là bắt buộc'],
            trim: true,
            maxlength: [50, 'Tên không gian làm việc không vượt quá 50 ký tự']
        },
        projectKey: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: [10, 'Mã dự án không vượt quá 10 ký tự']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Mô tả không vượt quá 200 ký tự']
        },
        isCloud: {
            type: Boolean,
            default: false
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization'
        },
        subTeamIds: [{
            type: Schema.Types.ObjectId,
            ref: 'SubTeam'
        }],
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        members: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: {
                type: String, // Trỏ tới name của bảng Role (Tích hợp Custom Role)
                default: 'Developer'
            },
            obsTitle: {
                type: String,
                trim: true
            },
            isBlockedFromIDE: {
                type: Boolean,
                default: false
            }
        }]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const Workspace = mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
