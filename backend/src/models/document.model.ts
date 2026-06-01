import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
    title: string;
    content: string;
    workspaceId: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId;
    parentId?: mongoose.Types.ObjectId;
    isFolder: boolean;
    visibility: 'workspace' | 'private' | 'restricted';
    collaborators: { userId: mongoose.Types.ObjectId; role: 'viewer' | 'editor' }[];
    createdAt: Date;
    updatedAt: Date;
}

const DocumentSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Tên tài liệu là bắt buộc'],
            trim: true
        },
        content: {
            type: String,
            default: ''
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
        parentId: {
            type: Schema.Types.ObjectId,
            ref: 'Document',
            default: null
        },
        isFolder: {
            type: Boolean,
            default: false
        },
        visibility: {
            type: String,
            enum: ['workspace', 'private', 'restricted'],
            default: 'workspace'
        },
        collaborators: [
            {
                userId: { type: Schema.Types.ObjectId, ref: 'User' },
                role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' }
            }
        ]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
