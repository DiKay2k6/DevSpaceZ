import { DropResult } from '@hello-pangea/dnd';
import { Board } from '@/features/board/api/board.api';
import { QueryClient } from '@tanstack/react-query';
import { BOARD_KEYS } from '@/features/board/hooks/useBoards';
import toast from 'react-hot-toast';

interface UseBoardDragAndDropArgs {
    localBoard: Board | null;
    setLocalBoard: (board: Board) => void;
    queryClient: QueryClient;
    id: string | undefined;
    isFilterActive: boolean;
    isViewer: boolean;
    canMoveTask: boolean;
    mutateMoveList: (data: any) => void;
    mutateMoveTask: (data: any) => void;
}

export const useBoardDragAndDrop = ({
    localBoard,
    setLocalBoard,
    queryClient,
    id,
    isFilterActive,
    isViewer,
    canMoveTask,
    mutateMoveList,
    mutateMoveTask
}: UseBoardDragAndDropArgs) => {

    const onDragEnd = (result: DropResult) => {
        // Chống kéo thả khi đang bật bộ lọc hoặc không có quyền hoặc bị disable
        if (isFilterActive || isViewer || !canMoveTask) return;

        const { destination, source, type } = result;

        // Bỏ ra ngoài khu vực dnd
        if (!destination || !localBoard || !localBoard.lists) return;

        // Thả lại chỗ cũ
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        // --- KÉO THẢ CỘT (LIST) ---
        if (type === 'list') {
            const newLists = Array.from(localBoard.lists);
            const [movedList] = newLists.splice(source.index, 1);
            newLists.splice(destination.index, 0, movedList);

            // Cập nhật lại order cho đúng với vị trí mới của các cột
            const updatedLists = newLists.map((list, index) => ({ ...list, order: index }));

            const updatedBoard = { ...localBoard, lists: updatedLists };

            setLocalBoard(updatedBoard);
            if (id) {
                // Chỉ setQueryData, useEffect ở KanbanBoard sẽ tự động đồng bộ sang localBoard 
                // giúp tránh 2 lần re-render
                queryClient.setQueryData(BOARD_KEYS.detail(id), updatedBoard);
            }

            // Gửi mảng ID và order mới lên Server
            mutateMoveList(updatedLists.map(l => ({ _id: l._id, order: l.order })));
            return;
        }

        // --- KÉO THẢ THẺ (TASK) ---
        const sourceListIndex = localBoard.lists.findIndex(l => l._id === source.droppableId);
        const destListIndex = localBoard.lists.findIndex(l => l._id === destination.droppableId);

        if (sourceListIndex < 0 || destListIndex < 0) return;

        const sourceList = localBoard.lists[sourceListIndex];
        const destList = localBoard.lists[destListIndex];

        // Tạo bản sao mới để không mutate state cũ
        const newLists = [...localBoard.lists];

        // 1. Kéo thả trong cùng 1 cột
        if (source.droppableId === destination.droppableId) {
            const newTasks = Array.from(sourceList.tasks);
            const [movedTask] = newTasks.splice(source.index, 1);
            newTasks.splice(destination.index, 0, movedTask);

            newLists[sourceListIndex] = { ...sourceList, tasks: newTasks };
        }
        // 2. Kéo thả sang cột khác
        else {
            const movedTask = sourceList.tasks[source.index];

            // Lôgic kiểm tra Dependencies (Blocked by)
            if (movedTask.dependencies && movedTask.dependencies.length > 0) {
                const allTasks = localBoard.lists.flatMap(l => l.tasks);
                const unfinishedDeps = movedTask.dependencies.filter(depId => {
                    const depTask = allTasks.find(t => t._id === depId);
                    return depTask && depTask.status !== 'Done';
                });

                if (unfinishedDeps.length > 0) {
                    window.alert(`Thẻ này đang bị khóa (Blocked) bởi ${unfinishedDeps.length} thẻ khác chưa hoàn thành!\nVui lòng hoàn thành các thẻ phụ thuộc trước.`);
                    return; // Hủy thao tác drag
                }
            }

            if (isViewer) {
                toast.error('Bạn chỉ có quyền xem (Viewer), không thể di chuyển thẻ!');
                return;
            }

            const sourceTasks = Array.from(sourceList.tasks);
            const destTasks = Array.from(destList.tasks);

            const [extractedTask] = sourceTasks.splice(source.index, 1);
            extractedTask.listId = destination.droppableId; // Cập nhật lại ID cột mới

            // Tự động cập nhật field 'status' của thẻ dựa theo tên cột (nếu có thể mapping logic ở Client)
            if (destList.title.toLowerCase().includes('done') || destList.title.toLowerCase().includes('hoàn thành')) extractedTask.status = 'Done';
            else if (destList.title.toLowerCase().includes('progress') || destList.title.toLowerCase().includes('đang làm')) extractedTask.status = 'In Progress';
            else if (destList.title.toLowerCase().includes('review') || destList.title.toLowerCase().includes('kiểm thử')) extractedTask.status = 'Review';
            else extractedTask.status = 'Not Started';

            destTasks.splice(destination.index, 0, extractedTask);

            newLists[sourceListIndex] = { ...sourceList, tasks: sourceTasks };
            newLists[destListIndex] = { ...destList, tasks: destTasks };
        }

        const updatedBoard = { ...localBoard, lists: newLists };

        // Optimistic UI Update (Cập nhật giao diện lập tức)
        setLocalBoard(updatedBoard);
        if (id) {
            queryClient.setQueryData(BOARD_KEYS.detail(id), updatedBoard);
        }

        // Chuẩn bị payload gửi lên BulkWrite API
        // Ta cần gửi id của tất cả các thẻ trong List nguồn và List đích kèm theo order (thứ tự) mới
        const movedItemsToUpdate: any[] = [];

        newLists[sourceListIndex].tasks.forEach((t, i) => {
            movedItemsToUpdate.push({ _id: t._id, listId: newLists[sourceListIndex]._id, order: i });
        });

        // Nếu kéo khác cột, ta phải gửi cả thứ tự của cột đích
        if (source.droppableId !== destination.droppableId) {
            newLists[destListIndex].tasks.forEach((t, i) => {
                movedItemsToUpdate.push({ _id: t._id, listId: newLists[destListIndex]._id, order: i });
            });
        }

        // Gọi API ngầm để lưu
        mutateMoveTask(movedItemsToUpdate);
    };

    return { onDragEnd };
};
