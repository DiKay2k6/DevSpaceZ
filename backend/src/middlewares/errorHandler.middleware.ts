import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/appError';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        logger.error(`[Development] Error: ${err.message}`, {
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            stack: err.stack,
            error: err
        });

        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production Mode
        let error = { ...err };
        error.message = err.message;

        // Xử lý các lỗi đặc thù của MongoDB/Mongoose
        if (err.name === 'CastError') {
            const message = `Invalid ${err.path}: ${err.value}.`;
            error = new AppError(message, 400);
        }
        if (err.code === 11000) {
            const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
            const message = `Duplicate field value: ${value}. Please use another value!`;
            error = new AppError(message, 400);
        }
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map((el: any) => el.message);
            const message = `Invalid input data. ${errors.join('. ')}`;
            error = new AppError(message, 400);
        }
        if (err.name === 'JsonWebTokenError') {
            error = new AppError('Invalid token. Please log in again!', 401);
        }
        if (err.name === 'TokenExpiredError') {
            error = new AppError('Your token has expired! Please log in again.', 401);
        }

        if (error.isOperational) {
            logger.warn(`[Operational Error]: ${error.message}`, {
                url: req.originalUrl,
                method: req.method,
                ip: req.ip
            });
            res.status(error.statusCode).json({
                status: error.status || 'error',
                message: error.message,
                code: error.code
            });
        } else {
            // Programming or other unknown error: don't leak error details
            logger.error(`[Programming/Unknown Error] 💥: ${err.message}`, {
                url: req.originalUrl,
                method: req.method,
                ip: req.ip,
                stack: err.stack
            });
            res.status(500).json({
                status: 'error',
                message: 'Something went very wrong!'
            });
        }
    }
};
