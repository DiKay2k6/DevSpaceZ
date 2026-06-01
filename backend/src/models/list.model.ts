import mongoose, { Schema, Document } from 'mongoose';

export interface IList extends Document {
    title: string;
    boardId: mongoose.Types.ObjectId;
    order: number; // Dùng để xác định vị trí của cột (Kéo thả kéo)
    wipLimit?: number; // Giới hạn Work In Progress cho Kanban
    createdAt: Date;
    updatedAt: Date;
}

const ListSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Tên danh sách là bắt buộc'],
            trim: true,
            maxlength: [50, 'Tên danh sách không vượt quá 50 ký tự']
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
        wipLimit: {
            type: Number,
            min: [0, 'WIP Limit không thể âm'],
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Index để truy vấn các cột thuộc một bảng và sắp xếp theo order
ListSchema.index({ boardId: 1, order: 1 });

export const List = mongoose.model<IList>('List', ListSchema);
