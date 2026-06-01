import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    taskId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema(
    {
        taskId: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
            index: true // Tăng tốc độ truy vấn comment theo task
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: [true, 'Nội dung bình luận không được để trống'],
            trim: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
