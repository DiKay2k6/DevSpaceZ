import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useBoardDetail } from '@/features/board/hooks/useBoards';
import { useBoardDragAndDrop } from '@/features/board/hooks/useBoardDragAndDrop';
import { useBoardSocket } from '@/features/board/hooks/useBoardSocket';
import { useBoardActions } from '@/features/board/hooks/useBoardActions';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Board, Task, boardApi } from '@/features/board/api/board.api';
import { useRoles } from '@/features/organization/hooks/useRoles';
import { subTeamApi } from '@/features/organization/api/subteam.api';
import { useQuery } from '@tanstack/react-query';

export const useKanbanLogic = (id: string | undefined) => {
    const { data: board, isLoading } = useBoardDetail(id || '');
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const boardActions = useBoardActions(id || '');

    // Khởi tạo kết nối Real-time Socket.io
    useBoardSocket(id);

    // Lấy danh sách Roles của Organization để đối chiếu quyền
    const orgId = board?.workspace?.organizationId;
    const { roles } = useRoles(orgId);

    const { data: subteams } = useQuery({
        queryKey: ['org-subteams', orgId],
        queryFn: () => subTeamApi.getSubTeamsByOrg(orgId!),
        enabled: !!orgId
    });

    // Lấy Role của User hiện tại trong Dự án (Workspace)
    const currentUserRole = useMemo(() => {
        if (!board || !user) return 'Viewer';
        const member = board.workspace?.members?.find((m: any) => 
            m._id === user._id || 
            (m as any).userId?._id === user._id || 
            (m as any).userId === user._id
        );
        return member?.role || 'Viewer';
    }, [board, user]);

    // Kiểm tra quyền dựa trên Ma trận (Roles)
    const hasPermission = (permissionCode: string) => {
        if (['Manager', 'Owner'].includes(currentUserRole)) return true; // Owner/Manager bypass
        const roleDef = roles?.find(r => r.name === currentUserRole);
        if (!roleDef) return false;
        return roleDef.permissions?.includes(permissionCode as any) || false;
    };

    const canCreateTask = hasPermission('task:create');
    const canManageColumns = hasPermission('list:create') || hasPermission('list:edit') || hasPermission('list:delete');
    const canDeleteTask = hasPermission('task:delete');
    const canMoveTask = hasPermission('task:move');
    const canEditTask = hasPermission('task:edit');
    const canAssignTask = hasPermission('task:assign');
    const canEditBoard = hasPermission('board:edit');
    const canDeleteBoard = hasPermission('board:delete');
    const isViewer = currentUserRole === 'Viewer' && !hasPermission('board:view'); // fallback

    // States cho Tạo Cột Mới
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [newListName, setNewListName] = useState('');

    // States cho Board Settings
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // States cho Task Detail Modal
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedListName, setSelectedListName] = useState<string>('');

    // Local state cho Optimistic UI
    const [localBoard, setLocalBoard] = useState<Board | null>(null);

    // States cho Filter & View Mode
    const [viewMode, setViewMode] = useState<'kanban' | 'plan'>('kanban');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
    const [selectedComponent, setSelectedComponent] = useState<string>('');
    const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
    const isFilterActive = searchQuery.trim().length > 0 || selectedAssignees.length > 0 || selectedComponent.length > 0;

    // Mutation để gọi API cập nhật vị trí thẻ
    const { mutate: mutateMoveTask } = useMutation({
        mutationFn: boardApi.moveTask,
        onError: () => {
            // Rollback nếu có lỗi
            if (board) setLocalBoard(board);
            alert('Đã có lỗi xảy ra khi lưu vị trí thẻ!');
        }
    });

    // Mutation để gọi API cập nhật vị trí cột
    const { mutate: mutateMoveList } = useMutation({
        mutationFn: boardApi.moveList,
        onError: () => {
            // Rollback nếu có lỗi
            if (board) setLocalBoard(board);
            alert('Đã có lỗi xảy ra khi lưu vị trí cột!');
        }
    });

    const handleCreateList = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim() || !id) return;
        boardActions.createList(newListName, {
            onSuccess: () => {
                setIsCreatingList(false);
                setNewListName('');
            }
        });
    };

    const handleUpdateTask = (taskId: string, data: Partial<Task>) => {
        if (selectedTask && selectedTask._id === taskId) {
            setSelectedTask({ ...selectedTask, ...data });
        }

        if (localBoard && localBoard.lists) {
            const newLists = localBoard.lists.map(list => ({
                ...list,
                tasks: list.tasks.map(t => t._id === taskId ? { ...t, ...data } : t)
            }));
            setLocalBoard({ ...localBoard, lists: newLists });
        }

        boardActions.updateTask({ taskId, data });
    };

    const handleUpdateBackground = (background: string) => {
        if (!localBoard || !id) return;
        // Optimistic update
        setLocalBoard({ ...localBoard, background });
        boardActions.updateBoard({ background });
    };

    const handleOpenTaskDetail = (task: Task, listName: string) => {
        setSelectedTask(task);
        setSelectedListName(listName);
    };

    // Đồng bộ Server Data vào Local State khi có data
    useEffect(() => {
        if (board) setLocalBoard(board);
    }, [board]);

    // Lắng nghe phím tắt Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCmdPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const { onDragEnd } = useBoardDragAndDrop({
        localBoard,
        setLocalBoard,
        queryClient,
        id,
        isFilterActive,
        isViewer,
        canMoveTask,
        mutateMoveList,
        mutateMoveTask
    });

    return {
        board,
        localBoard,
        isLoading,
        currentUserRole,
        canCreateTask,
        canManageColumns,
        canDeleteTask,
        canMoveTask,
        canEditTask,
        canAssignTask,
        canEditBoard,
        canDeleteBoard,
        isViewer,
        subteams,
        
        isCreatingList,
        setIsCreatingList,
        newListName,
        setNewListName,
        handleCreateList,

        isSettingsOpen,
        setIsSettingsOpen,
        handleUpdateBackground,

        selectedTask,
        setSelectedTask,
        selectedListName,
        setSelectedListName,
        handleOpenTaskDetail,
        handleUpdateTask,

        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        selectedAssignees,
        setSelectedAssignees,
        selectedComponent,
        setSelectedComponent,
        isFilterActive,

        isCmdPaletteOpen,
        setIsCmdPaletteOpen,

        onDragEnd,
        boardActions
    };
};
