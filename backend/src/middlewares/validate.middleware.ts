import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod'; // Đổi AnyZodObject thành ZodSchema

export const validate = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Dùng schema để ép kiểu và kiểm tra req.body
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next(); // Dữ liệu chuẩn, cho phép đi tiếp vào Controller
        } catch (error) {
            if (error instanceof ZodError) {
                // Sửa error.errors thành error.issues theo chuẩn Zod mới
                const errorMessages = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                res.status(400).json({
                    status: 'fail',
                    message: 'Dữ liệu đầu vào không hợp lệ',
                    errors: errorMessages, // Trả về chi tiết lỗi cho Frontend dễ báo đỏ ô input
                });
            } else {
                next(error);
            }
        }
    };
};