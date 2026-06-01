import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
    userId: mongoose.Types.ObjectId;
    friendId: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: Date;
}

const contactSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    friendId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

// A user cannot friend the same person twice
contactSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export const Contact = mongoose.model<IContact>('Contact', contactSchema);
