import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskRequest extends Document {
    taskId: mongoose.Types.ObjectId;
    boardId: mongoose.Types.ObjectId; // Tiện cho việc query sau này
    userId: mongoose.Types.ObjectId;
    type: 'Join' | 'Leave';
    reason?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approverId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const taskRequestSchema = new Schema(
    {
        taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
        boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['Join', 'Leave'], required: true },
        reason: { type: String },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        approverId: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    {
        timestamps: true
    }
);

export const TaskRequest = mongoose.model<ITaskRequest>('TaskRequest', taskRequestSchema);
