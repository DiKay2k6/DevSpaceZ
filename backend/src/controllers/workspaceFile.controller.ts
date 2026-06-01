import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { File } from '../models/file.model';
import { Workspace } from '../models/workspace.model';
import { AppError } from '../utils/appError';

export const workspaceFileController = {
    /**
     * @route GET /api/v1/workspaces/:id/workspace
     * @desc Trả về toàn bộ cấu trúc file và nội dung của dự án Cloud
     */
    getWorkspaceFiles: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            
            const workspace = await Workspace.findById(id);
            if (!workspace) throw new AppError(404, 'Không tìm thấy Workspace');
            if (!workspace.isCloud) throw new AppError(400, 'Đây không phải là dự án Cloud');

            const objectId = new mongoose.Types.ObjectId(id as string);
            const userId = new mongoose.Types.ObjectId((req as any).user.id);
            const files = await File.find({ workspaceId: objectId }).lean();
            
            // ACL: Lọc các đường dẫn bị cấm đọc (Inheritance)
            const blockedPaths = files
                .filter(f => f.restrictedRead && f.restrictedRead.some(uid => uid.toString() === userId.toString()))
                .map(f => f.path);

            const accessibleFiles = files.filter(f => {
                return !blockedPaths.some(bp => f.path === bp || f.path.startsWith(`${bp}/`));
            });
            
            // Format files to a structure suitable for WebContainer or Frontend usage
            const fileSystemTree: any = {};
            
            // Build tree structure
            for (const file of accessibleFiles) {
                const parts = file.path.split('/');
                let current = fileSystemTree;
                
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    if (i === parts.length - 1) {
                        // Leaf node
                        if (file.type === 'file') {
                            current[part] = {
                                file: { contents: file.content || '' }
                            };
                        } else {
                            if (!current[part]) {
                                current[part] = { directory: {} };
                            }
                        }
                    } else {
                        // Directory node
                        if (!current[part]) {
                            current[part] = { directory: {} };
                        }
                        current = current[part].directory;
                    }
                }
            }

            res.status(200).json({
                status: 'success',
                data: fileSystemTree
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route PUT /api/v1/workspaces/:id/files
     * @desc Cập nhật nội dung một file (hoặc tạo nếu chưa có)
     */
    saveFile: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { path, content } = req.body;
            
            if (!path) throw new AppError(400, 'Đường dẫn file là bắt buộc');

            const workspace = await Workspace.findById(id);
            if (!workspace) throw new AppError(404, 'Không tìm thấy Workspace');

            const objectId = new mongoose.Types.ObjectId(id as string);
            const userId = new mongoose.Types.ObjectId((req as any).user.id);

            // ACL Check: Kiểm tra xem user có bị cấm ghi file/folder này không
            const existingFile = await File.findOne({ workspaceId: objectId, path });
            if (existingFile && existingFile.restrictedWrite && existingFile.restrictedWrite.some(uid => uid.toString() === userId.toString())) {
                throw new AppError(403, 'Bạn không có quyền chỉnh sửa file này');
            }

            // Kiểm tra cha (Folder chứa nó) có bị cấm ghi không
            const parentParts = path.split('/');
            if (parentParts.length > 1) {
                parentParts.pop();
                const parentPath = parentParts.join('/');
                const parentFile = await File.findOne({ workspaceId: objectId, path: parentPath });
                if (parentFile && parentFile.restrictedWrite && parentFile.restrictedWrite.some(uid => uid.toString() === userId.toString())) {
                    throw new AppError(403, 'Bạn không có quyền ghi vào thư mục này');
                }
            }

            // Upsert (Cập nhật hoặc Tạo mới nếu chưa có)
            const file = await File.findOneAndUpdate(
                { workspaceId: objectId, path },
                { 
                    $set: { 
                        type: 'file', 
                        content,
                        workspaceId: objectId,
                        path
                    }
                },
                { new: true, upsert: true }
            );

            res.status(200).json({
                status: 'success',
                message: 'Đã lưu file thành công',
                data: file
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route POST /api/v1/workspaces/:id/files
     * @desc Tạo thư mục (hoặc file trống)
     */
    createFile: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { path, type } = req.body;
            
            if (!path || !type) throw new AppError(400, 'Đường dẫn và kiểu (file/directory) là bắt buộc');

            const objectId = new mongoose.Types.ObjectId(id as string);
            const userId = new mongoose.Types.ObjectId((req as any).user.id);
            
            // Kiem tra ACL cha
            const parentParts = path.split('/');
            if (parentParts.length > 1) {
                parentParts.pop();
                const parentPath = parentParts.join('/');
                const parentFile = await File.findOne({ workspaceId: objectId, path: parentPath });
                if (parentFile && parentFile.restrictedWrite && parentFile.restrictedWrite.some(uid => uid.toString() === userId.toString())) {
                    throw new AppError(403, 'Bạn không có quyền tạo file trong thư mục này');
                }
            }

            const exists = await File.findOne({ workspaceId: objectId, path });
            if (exists) throw new AppError(400, 'Đường dẫn đã tồn tại');

            const newFile = await File.create({
                workspaceId: objectId,
                path,
                type,
                content: ''
            });

            res.status(201).json({
                status: 'success',
                message: 'Tạo thành công',
                data: newFile
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route DELETE /api/v1/workspaces/:id/files
     * @desc Xóa file hoặc thư mục
     */
    deleteFile: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { path } = req.query; // path = 'frontend/src'
            
            if (!path || typeof path !== 'string') throw new AppError(400, 'Đường dẫn là bắt buộc');

            const objectId = new mongoose.Types.ObjectId(id as string);
            const userId = new mongoose.Types.ObjectId((req as any).user.id);

            const fileToDelete = await File.findOne({ workspaceId: objectId, path });
            if (!fileToDelete) throw new AppError(404, 'Không tìm thấy file/folder để xóa');

            if (fileToDelete.restrictedWrite && fileToDelete.restrictedWrite.some(uid => uid.toString() === userId.toString())) {
                throw new AppError(403, 'Bạn không có quyền xóa đối tượng này');
            }

            // Tìm và xóa file cụ thể, hoặc xóa tất cả con của thư mục
            await File.deleteMany({
                workspaceId: objectId,
                $or: [
                    { path },
                    { path: { $regex: `^${path}/` } } // Xóa tất cả file nằm trong thư mục
                ]
            });

            res.status(200).json({
                status: 'success',
                message: 'Đã xóa thành công'
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route PUT /api/v1/workspaces/:id/files/permissions
     * @desc Cập nhật quyền (ACL) của một file/folder
     */
    updatePermissions: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { path, restrictedRead, restrictedWrite } = req.body;
            
            if (!path) throw new AppError(400, 'Đường dẫn là bắt buộc');

            const objectId = new mongoose.Types.ObjectId(id as string);

            // Kiểm tra xem user hiện tại có phải Owner/Manager không
            const workspace = await Workspace.findById(id);
            if (!workspace) throw new AppError(404, 'Không tìm thấy Workspace');

            const userId = (req as any).user.id;
            const member = workspace.members.find(m => m.userId.toString() === userId);
            if (workspace.ownerId.toString() !== userId && (!member || (member.role !== 'Manager' && member.role !== 'Leader'))) {
                throw new AppError(403, 'Chỉ Owner, Manager hoặc Leader mới có thể phân quyền File');
            }

            const updatedFile = await File.findOneAndUpdate(
                { workspaceId: objectId, path },
                { 
                    $set: { 
                        restrictedRead: restrictedRead || [],
                        restrictedWrite: restrictedWrite || []
                    } 
                },
                { new: true, upsert: true }
            );

            res.status(200).json({
                status: 'success',
                message: 'Cập nhật quyền thành công',
                data: updatedFile
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    },

    /**
     * @route GET /api/v1/workspaces/:id/files/permissions
     * @desc Lấy quyền (ACL) của một file/folder
     */
    getFilePermissions: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { path } = req.query;
            
            if (!path || typeof path !== 'string') throw new AppError(400, 'Đường dẫn là bắt buộc');

            const objectId = new mongoose.Types.ObjectId(id as string);
            const file = await File.findOne({ workspaceId: objectId, path }).lean();
            
            if (!file) {
                return res.status(200).json({
                    status: 'success',
                    data: { restrictedRead: [], restrictedWrite: [] }
                });
            }

            res.status(200).json({
                status: 'success',
                data: {
                    restrictedRead: file.restrictedRead || [],
                    restrictedWrite: file.restrictedWrite || []
                }
            });
        } catch (error: any) {
            const status = error.statusCode || 500;
            res.status(status).json({ status: 'error', message: error.message });
        }
    }
};
