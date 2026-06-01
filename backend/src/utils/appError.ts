export class AppError extends Error {
    public statusCode: number;
    public status: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number);
    constructor(statusCode: number, message: string);
    constructor(arg1: string | number, arg2: string | number) {
        const message = typeof arg1 === 'string' ? arg1 : typeof arg2 === 'string' ? arg2 : 'Unknown Error';
        const statusCode = typeof arg1 === 'number' ? arg1 : typeof arg2 === 'number' ? arg2 : 500;
        
        super(message);
        this.statusCode = statusCode;

        // Nếu lỗi 4xx thì status là 'fail', lỗi 5xx thì status là 'error'
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        // Đánh dấu đây là lỗi nghiệp vụ (operational) do mình chủ động quăng ra
        // (để phân biệt với các lỗi bug code đột xuất)
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}