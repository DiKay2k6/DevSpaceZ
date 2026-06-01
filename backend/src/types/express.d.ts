import { IUser } from '../models/user.model';

// Mở rộng interface Request mặc định của Express
declare global {
    namespace Express {
        interface Request {
            user?: IUser; // Khai báo thêm thuộc tính user
        }
    }
}