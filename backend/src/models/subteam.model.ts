import mongoose, { Schema, Document } from 'mongoose';

export interface ISubTeamMember {
    userId: mongoose.Types.ObjectId;
    role: 'Leader' | 'Member';
}

export interface ISubTeam extends Document {
    name: string;
    description?: string;
    organizationId: mongoose.Types.ObjectId;
    members: ISubTeamMember[];
    createdAt: Date;
    updatedAt: Date;
}

const SubTeamSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên nhóm là bắt buộc'],
            trim: true,
            maxlength: [50, 'Tên nhóm không vượt quá 50 ký tự']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Mô tả không vượt quá 200 ký tự']
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: 'Organization',
            required: true
        },
        members: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: {
                type: String,
                enum: ['Leader', 'Member'],
                default: 'Member'
            }
        }]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

SubTeamSchema.index({ organizationId: 1 });

export const SubTeam = mongoose.model<ISubTeam>('SubTeam', SubTeamSchema);
