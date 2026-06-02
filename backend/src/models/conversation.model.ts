import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema(
    {
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
        lastMessageAt: {
            type: Date
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
