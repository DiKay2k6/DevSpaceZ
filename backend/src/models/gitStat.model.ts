import mongoose, { Document, Schema } from 'mongoose';

export interface IGitDailyStat extends Document {
    userId: mongoose.Types.ObjectId;
    date: Date;
    commits: number;
    prsMerged: number;
    linesAdded: number;
    linesDeleted: number;
    createdAt: Date;
    updatedAt: Date;
}

const GitDailyStatSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: Date, // We will store this as the start of the day (e.g., 2026-06-03T00:00:00.000Z)
            required: true
        },
        commits: {
            type: Number,
            default: 0
        },
        prsMerged: {
            type: Number,
            default: 0
        },
        linesAdded: {
            type: Number,
            default: 0
        },
        linesDeleted: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Compound index for fast queries of a user's stats over a date range
GitDailyStatSchema.index({ userId: 1, date: -1 }, { unique: true });

export const GitDailyStat = mongoose.model<IGitDailyStat>('GitDailyStat', GitDailyStatSchema);
