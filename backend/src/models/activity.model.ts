import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity extends Document {
    workspaceId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    action: string;
    targetName: string;
    targetType: 'Workspace' | 'Board' | 'List' | 'Task' | 'Comment' | 'User';
    createdAt: Date;
}

const ActivitySchema = new Schema(
    {
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        action: {
            type: String,
            required: true
            // Ví dụ: 'tạo', 'cập nhật', 'xóa', 'mời'
        },
        targetName: {
            type: String,
            required: true
            // Ví dụ: 'Board Dự án Mới', 'Task Lỗi UI'
        },
        targetType: {
            type: String,
            enum: ['Workspace', 'Board', 'List', 'Task', 'Comment', 'User'],
            required: true
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Activity chỉ cần lúc tạo
        versionKey: false
    }
);

// Compound Index để lấy danh sách hoạt động theo workspace và sắp xếp theo thời gian mới nhất (Pagination)
ActivitySchema.index({ workspaceId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
