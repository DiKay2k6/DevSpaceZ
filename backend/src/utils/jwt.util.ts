import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateAccessToken = (userId: Types.ObjectId | string): string => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not defined in .env file");
    }

    // Access Token sống trong 15 phút
    return jwt.sign({ id: userId.toString() }, secret, {
        expiresIn: '15m',
    });
};

export const generateRefreshToken = (userId: Types.ObjectId | string): string => {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_REFRESH_SECRET is not defined in .env file");
    }

    // Refresh Token sống trong 7 ngày
    return jwt.sign({ id: userId.toString() }, secret, {
        expiresIn: '7d',
    });
};

export const generateResetToken = (email: string): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined in .env file");

    return jwt.sign({ email }, secret, { expiresIn: '15m' }); // Chỉ sống 15 phút
};

export const verifyToken = (token: string): any => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not defined in .env file");

    return jwt.verify(token, secret);
};

export const verifyRefreshToken = (token: string): any => {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_REFRESH_SECRET is not defined in .env file");

    return jwt.verify(token, secret);
};