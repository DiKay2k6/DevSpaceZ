import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
    workspaceId: mongoose.Types.ObjectId;
    path: string;
    type: 'file' | 'directory';
    content?: string;
    restrictedRead?: mongoose.Types.ObjectId[];
    restrictedWrite?: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const FileSchema = new Schema(
    {
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true,
            index: true
        },
        path: {
            type: String,
            required: true,
            index: true
        },
        type: {
            type: String,
            enum: ['file', 'directory'],
            required: true
        },
        content: {
            type: String,
            default: ''
        },
        restrictedRead: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        restrictedWrite: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
        timestamps: true
    }
);

// Đảm bảo đường dẫn file là duy nhất trong một dự án
FileSchema.index({ workspaceId: 1, path: 1 }, { unique: true });

export const File = mongoose.model<IFile>('File', FileSchema);
