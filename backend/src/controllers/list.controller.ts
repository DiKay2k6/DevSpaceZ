import { Request, Response } from 'express';
import { getIO } from '../utils/socket';
import { List } from '../models/list.model';
import { Board } from '../models/board.model';
import { Task } from '../models/task.model';
import { AppError } from '../utils/appError';

export const listController = {
    /**
     * @route POST /api/v1/lists
     * @desc Tạo một cột (List) mới trong bảng
     * @access Private
     */
    createList: async (req: Request, res: Response) => {
        try {
            const { title, boardId } = req.body;
            const userId = (req as any).user.id;

            // Kiểm tra Board có tồn tại
            const board = await Board.findOne({ _id: boardId }).lean();
            if (!board) {
                throw new AppError(404, 'Không tìm thấy Bảng Kanban');
            }

            // Tính toán order: Đặt cột mới vào vị trí cuối cùng
            const count = await List.countDocuments({ boardId });

            const newList = await List.create({
                title,
                boardId,
                order: count // Vị trí cuối
            });

            // Gắn mảng rỗng để khớp với frontend List interface
            const listWithTasks = { ...newList.toObject(), tasks: [] };
            
            getIO().to(boardId.toString()).emit('board_updated', { action: 'create_list' });

            res.status(201).json({
                status: 'success',
                data: {
                    list: listWithTasks
                }
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({
                status: 'error',
                message: error.message || 'Lỗi hệ thống'
            });
        }
    },

    /**
     * @route DELETE /api/v1/lists/:id
     * @desc Xóa cột và các thẻ nằm trong cột
     * @access Private
     */
    deleteList: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            const list = await List.findById(id);
            if (!list) {
                throw new AppError(404, 'Không tìm thấy danh sách');
            }

            // Xóa tất cả các thẻ nằm trong cột này
            await Task.deleteMany({ listId: id });
            
            // Xóa cột
            await List.findByIdAndDelete(id);
            
            getIO().to(list.boardId.toString()).emit('board_updated', { action: 'delete_list' });

            res.status(200).json({
                status: 'success',
                message: 'Xóa danh sách thành công'
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({
                status: 'error',
                message: error.message || 'Lỗi hệ thống khi xóa danh sách'
            });
        }
    },

    /**
     * @route PUT /api/v1/lists/:id
     * @desc Cập nhật thông tin cột (đổi tên, đặt WIP Limit)
     * @access Private
     */
    updateList: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { title, wipLimit } = req.body;

            const list = await List.findById(id);
            if (!list) {
                throw new AppError(404, 'Không tìm thấy danh sách');
            }

            if (title !== undefined) list.title = title;
            if (wipLimit !== undefined) list.wipLimit = wipLimit;

            await list.save();
            
            getIO().to(list.boardId.toString()).emit('board_updated', { action: 'update_list' });

            res.status(200).json({
                status: 'success',
                data: {
                    list
                }
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({
                status: 'error',
                message: error.message || 'Lỗi hệ thống khi cập nhật danh sách'
            });
        }
    },

    /**
     * @route PUT /api/v1/lists/move
     * @desc Cập nhật vị trí của các cột khi kéo thả
     * @access Private
     */
    moveList: async (req: Request, res: Response) => {
        try {
            const { items } = req.body; // Mảng các item: { _id, order }

            if (!items || !Array.isArray(items)) {
                throw new AppError(400, 'Dữ liệu đầu vào không hợp lệ');
            }

            // Tạo các phép toán BulkWrite
            const bulkOperations = items.map((item: any) => ({
                updateOne: {
                    filter: { _id: item._id },
                    update: { $set: { order: item.order } }
                }
            }));

            // Thực thi tất cả các cập nhật trong 1 lần gọi db duy nhất
            if (bulkOperations.length > 0) {
                await List.bulkWrite(bulkOperations);
                
                const firstList = await List.findById(items[0]._id).select('boardId');
                if (firstList) {
                    getIO().to(firstList.boardId.toString()).emit('board_updated', { action: 'move_lists' });
                }
            }

            res.status(200).json({
                status: 'success',
                message: 'Cập nhật vị trí cột thành công'
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({
                status: 'error',
                message: error.message || 'Lỗi hệ thống khi di chuyển cột'
            });
        }
    }
};
