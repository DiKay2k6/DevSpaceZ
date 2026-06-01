import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/appError';
import { Workspace } from '../models/workspace.model';
import { Board } from '../models/board.model';
import { List } from '../models/list.model';
import { Task } from '../models/task.model';
import { Organization } from '../models/organization.model';
import { Role, PERMISSIONS } from '../models/role.model';
import { SubTeam } from '../models/subteam.model';

type ResourceType = 'Workspace' | 'Board' | 'List' | 'Task' | 'Document';
type IdSource = 'params.id' | 'body.boardId' | 'body.listId' | 'body.workspaceId' | 'body.items';

const getWorkspaceId = async (resourceType: ResourceType, resourceId: string): Promise<string | null> => {
    switch (resourceType) {
        case 'Workspace':
            return resourceId;
        case 'Board': {
            const board = await Board.findById(resourceId).lean();
            return board ? board.workspaceId.toString() : null;
        }
        case 'List': {
            const list = await List.findById(resourceId).lean();
            if (!list) return null;
            const board = await Board.findById(list.boardId).lean();
            return board ? board.workspaceId.toString() : null;
        }
        case 'Task': {
            const task = await Task.findById(resourceId).lean();
            if (!task) return null;
            const board = await Board.findById(task.boardId).lean();
            return board ? board.workspaceId.toString() : null;
        }
        case 'Document': {
            const DocumentModel = mongoose.model('Document');
            const doc = await DocumentModel.findById(resourceId).lean() as any;
            return doc ? doc.workspaceId.toString() : null;
        }
        default:
            return null;
    }
};

export const requirePermission = (
    permissionCode: string,
    resourceType: ResourceType,
    idSource: IdSource = 'params.id'
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return next(new AppError('Bạn chưa đăng nhập', 401));
            }

            // 1. Xác định resource ID
            let resourceId = '';
            if (idSource === 'params.id') resourceId = req.params.id as string;
            else if (idSource === 'body.boardId') resourceId = req.body.boardId;
            else if (idSource === 'body.listId') resourceId = req.body.listId;
            else if (idSource === 'body.workspaceId') resourceId = req.body.workspaceId;
            else if (idSource === 'body.items') {
                const items = req.body.items;
                if (Array.isArray(items) && items.length > 0) {
                    resourceId = items[0]._id; // Dùng phần tử đầu tiên để kiểm tra
                }
            }

            if (!resourceId) {
                return next(new AppError('Không xác định được đối tượng thao tác', 400));
            }

            // 2. Tìm Workspace ID
            const workspaceId = await getWorkspaceId(resourceType, resourceId);
            if (!workspaceId) {
                return next(new AppError('Không tìm thấy tài nguyên', 404));
            }

            // 3. Tìm Workspace
            const workspace = await Workspace.findById(workspaceId).lean();
            if (!workspace) {
                return next(new AppError('Không tìm thấy không gian làm việc', 404));
            }

            // 4. Kiểm tra Owner
            if (workspace.ownerId.toString() === userId) {
                return next(); // Owner luôn có toàn quyền
            }

            // 4.5 Kiểm tra Quyền riêng của Document (Resource-level ACL)
            if (resourceType === 'Document' && resourceId) {
                const DocumentModel = mongoose.model('Document');
                const doc = await DocumentModel.findById(resourceId).lean() as any;
                if (doc) {
                    const isDocOwner = doc.ownerId.toString() === userId;
                    
                    // Check if Manager (since Managers bypass doc visibility)
                    let isManager = false;
                    const directMember = workspace.members?.find((m: any) => m.userId.toString() === userId);
                    if (directMember && directMember.role === 'Manager') isManager = true;
                    else if (workspace.organizationId) {
                        const OrganizationModel = mongoose.model('Organization');
                        const org = await OrganizationModel.findById(workspace.organizationId).lean() as any;
                        const orgMember = org?.members?.find((m: any) => m.userId.toString() === userId);
                        if (orgMember && orgMember.role === 'Manager') isManager = true;
                    }

                    if (isManager || isDocOwner) {
                        return next(); // Manager và Owner Document luôn có quyền
                    }

                    const collab = doc.collaborators?.find((c: any) => c.userId.toString() === userId);
                    const isEditor = collab?.role === 'editor';
                    const isViewer = collab?.role === 'viewer';

                    // Nếu file private/restricted mà không có quyền thì văng lỗi luôn (Override Global RBAC)
                    if (doc.visibility === 'private') {
                        return next(new AppError('Tài liệu này là riêng tư, chỉ chủ sở hữu được phép truy cập', 403));
                    }
                    if (doc.visibility === 'restricted' && !isEditor && !isViewer) {
                        return next(new AppError('Bạn không có quyền truy cập tài liệu này', 403));
                    }
                    
                    // Nếu đã là Editor thì cho phép sửa luôn (Override Global RBAC)
                    if (permissionCode === 'document:edit' && isEditor) {
                        return next();
                    }
                    
                    // Nếu là Viewer nhưng cố tình sửa thì chặn luôn
                    if (permissionCode === 'document:edit' && isViewer) {
                        return next(new AppError('Bạn chỉ có quyền xem tài liệu này', 403));
                    }
                }
            }

            // 5. Xác định Role của User
            let userRoleName = '';

            // Kiểm tra trong thành viên trực tiếp
            const directMember = workspace.members?.find((m: any) => m.userId.toString() === userId);
            
            if (directMember) {
                if (directMember.role === 'Manager') return next(); // Manager có toàn quyền
                userRoleName = directMember.role;
            } else if (workspace.subTeamIds && workspace.subTeamIds.length > 0) {
                // Kiểm tra trong SubTeams
                const subTeams = await SubTeam.find({ _id: { $in: workspace.subTeamIds } }).lean();
                let isLeader = false;
                let isInSubTeam = false;
                
                for (const team of subTeams) {
                    const member = team.members?.find((m: any) => m.userId.toString() === userId);
                    if (member) {
                        isInSubTeam = true;
                        if (member.role === 'Leader') isLeader = true;
                    }
                }

                if (isInSubTeam) {
                    if (isLeader) {
                        userRoleName = 'Leader';
                    } else {
                        // Lấy role từ Organization
                        if (workspace.organizationId) {
                            const org = await Organization.findById(workspace.organizationId).lean();
                            const orgMember = org?.members?.find((m: any) => m.userId.toString() === userId);
                            if (orgMember && orgMember.role === 'Manager') return next();
                            userRoleName = orgMember?.role || 'Developer';
                        }
                    }
                }
            }

            if (!userRoleName) {
                return next(new AppError('Bạn không có quyền truy cập dự án này', 403));
            }

            // 6. Kiểm tra quyền của Role đó
            if (workspace.organizationId) {
                const roleDoc = await Role.findOne({ 
                    organizationId: workspace.organizationId, 
                    name: userRoleName 
                }).lean();

                if (roleDoc && roleDoc.permissions.includes(permissionCode as any)) {
                    return next(); // Hợp lệ
                }
            } else {
                // Nếu không có Organization, chỉ dùng default mapping cơ bản
                const defaultRoles: Record<string, string[]> = {
                    'Manager': [...PERMISSIONS],
                    'Leader': ['board:edit', 'board:delete', 'list:create', 'list:edit', 'list:delete', 'task:create', 'task:edit', 'task:delete', 'task:move', 'task:assign'],
                    'Developer': ['task:create', 'task:edit', 'task:move', 'task:assign']
                };
                if (defaultRoles[userRoleName]?.includes(permissionCode)) {
                    return next();
                }
            }

            // Từ chối
            return next(new AppError(`Bạn không có quyền thực hiện hành động này (${permissionCode})`, 403));

        } catch (error) {
            return next(new AppError('Lỗi kiểm tra phân quyền', 500));
        }
    };
};
