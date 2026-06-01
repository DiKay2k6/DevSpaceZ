import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description?: string;
    listId: mongoose.Types.ObjectId;
    boardId: mongoose.Types.ObjectId; // Denormalization để dễ truy vấn toàn bộ task của board
    order: number;
    priority: 'Low' | 'Medium' | 'High';
    type: 'Task' | 'Feature' | 'Bug' | 'Chore' | 'Epic';
    status: 'Not Started' | 'In Progress' | 'Review' | 'Done';
    parentId?: mongoose.Types.ObjectId;
    component?: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Design' | 'Other';
    assignees: mongoose.Types.ObjectId[];
    startDate?: Date;
    dueDate?: Date;
    labels?: { text: string; color: string }[];
    storyPoints?: number;
    checklists?: { _id: string; title: string; isCompleted: boolean }[];
    dependencies?: mongoose.Types.ObjectId[];
    attachments?: { filename: string; url: string; mimetype: string; uploadedBy: mongoose.Types.ObjectId; createdAt: Date }[];
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Tên công việc là bắt buộc'],
            trim: true,
            maxlength: [100, 'Tên công việc không vượt quá 100 ký tự']
        },
        description: {
            type: String,
            trim: true
        },
        listId: {
            type: Schema.Types.ObjectId,
            ref: 'List',
            required: true
        },
        boardId: {
            type: Schema.Types.ObjectId,
            ref: 'Board',
            required: true
        },
        order: {
            type: Number,
            required: true,
            default: 0
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        },
        type: {
            type: String,
            enum: ['Task', 'Feature', 'Bug', 'Chore', 'Epic'],
            default: 'Task'
        },
        status: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Review', 'Done'],
            default: 'Not Started'
        },
        parentId: {
            type: Schema.Types.ObjectId,
            ref: 'Task'
        },
        component: {
            type: String,
            enum: ['Frontend', 'Backend', 'Database', 'DevOps', 'Design', 'Other']
        },
        assignees: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        startDate: {
            type: Date
        },
        dueDate: {
            type: Date
        },
        labels: [{
            text: { type: String, required: true },
            color: { type: String, required: true }
        }],
        storyPoints: {
            type: Number,
            default: 0
        },
        checklists: [{
            title: { type: String, required: true },
            isCompleted: { type: Boolean, default: false }
        }],
        dependencies: [{
            type: Schema.Types.ObjectId,
            ref: 'Task'
        }],
        attachments: [{
            filename: String,
            url: String,
            mimetype: String,
            uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Index giúp tìm kiếm task theo list nhanh chóng và sắp xếp theo order
TaskSchema.index({ listId: 1, order: 1 });
// Index phụ để lấy tất cả task trong một board
TaskSchema.index({ boardId: 1 });
// Compound Indexes cho chức năng Filter (Lọc task theo người nhận và theo component)
TaskSchema.index({ boardId: 1, assignees: 1 });
TaskSchema.index({ boardId: 1, component: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
