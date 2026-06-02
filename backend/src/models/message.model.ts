import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    boardId?: mongoose.Types.ObjectId;
    conversationId?: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'none';
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema(
    {
        boardId: {
            type: Schema.Types.ObjectId,
            ref: 'Board'
        },
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation'
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            trim: true,
            maxlength: [2000, 'Tin nhắn không vượt quá 2000 ký tự']
        },
        mediaUrl: {
            type: String,
            trim: true
        },
        mediaType: {
            type: String,
            enum: ['image', 'video', 'none'],
            default: 'none'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Index để lấy danh sách tin nhắn nhanh hơn
MessageSchema.index({ boardId: 1, createdAt: 1 });
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
