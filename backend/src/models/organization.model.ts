import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganizationMember {
    userId: mongoose.Types.ObjectId;
    role: string; // Đổi thành string
    status: 'Pending' | 'Joined';
}

export interface IOrganization extends Document {
    name: string;
    description?: string;
    ownerId: mongoose.Types.ObjectId;
    members: IOrganizationMember[];
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Tên tổ chức là bắt buộc'],
            trim: true,
            maxlength: [50, 'Tên tổ chức không vượt quá 50 ký tự']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [200, 'Mô tả không vượt quá 200 ký tự']
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        members: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: {
                type: String, // Trỏ tới name của bảng Role
                default: 'Developer'
            },
            status: {
                type: String,
                enum: ['Pending', 'Joined'],
                default: 'Pending'
            }
        }]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
