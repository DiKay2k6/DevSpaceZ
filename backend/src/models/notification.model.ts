import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId; // Người nhận
    type: 'Mention' | 'TaskAssigned' | 'TaskUpdated' | 'WorkspaceInvite' | 'OrganizationInvite';
    content: string;
    isRead: boolean;
    relatedTaskId?: mongoose.Types.ObjectId;
    workspaceId?: mongoose.Types.ObjectId; // Lời mời vào Workspace
    organizationId?: mongoose.Types.ObjectId; // Lời mời vào Organization
    senderId?: mongoose.Types.ObjectId;
    actionStatus?: 'pending' | 'accepted' | 'declined'; // Trạng thái của lời mời
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        type: {
            type: String,
            enum: ['Mention', 'TaskAssigned', 'TaskUpdated', 'WorkspaceInvite', 'OrganizationInvite'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        isRead: {
            type: Boolean,
            default: false
        },
        relatedTaskId: {
            type: Schema.Types.ObjectId,
            ref: 'Task'
        },
        workspaceId: {
            type: Schema.Types.ObjectId,
            ref: 'Workspace'
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization'
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        actionStatus: {
            type: String,
            enum: ['pending', 'accepted', 'declined']
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
