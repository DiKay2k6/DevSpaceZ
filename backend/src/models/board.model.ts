import mongoose, { Schema, Document } from 'mongoose';

export interface IBoard extends Document {
    title: string;
    description?: string;
    background?: string;
    workspaceId: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId;
    status: 'Planning' | 'In Progress' | 'Completed';
    lists: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const BoardSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Tên bảng là bắt buộc'],
            trim: true,
            maxlength: [100, 'Tên bảng không vượt quá 100 ký tự']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [255, 'Mô tả không vượt quá 255 ký tự']
        },
        background: {
            type: String,
            default: 'linear-gradient(135deg, #00C6ff, #0072ff)', // Default blue gradient
        },
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['Planning', 'In Progress', 'Completed'],
            default: 'Planning'
        },
        lists: [{
            type: Schema.Types.ObjectId,
            ref: 'List'
        }]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Index để truy vấn các bảng thuộc một workspace nhanh hơn
BoardSchema.index({ workspaceId: 1 });

export const Board = mongoose.model<IBoard>('Board', BoardSchema);
