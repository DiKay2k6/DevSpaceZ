import React, { useEffect } from 'react';
import { Task } from '@/features/board/api/board.api';
import { SearchedUser } from '@/features/workspace/api/workspace.api';
import { useQuery } from '@tanstack/react-query';
import { boardApi } from '@/features/board/api/board.api';
import { useBoardActions } from '@/features/board/hooks/useBoardActions';

// Import các sub-components
import { TaskHeader } from './TaskDetail/TaskHeader';
import { TaskProperties } from './TaskDetail/TaskProperties';
import { TaskDescription } from './TaskDetail/TaskDescription';
import { TaskChecklists } from './TaskDetail/TaskChecklists';
import { TaskAttachments } from './TaskDetail/TaskAttachments';
import { TaskComments } from './TaskDetail/TaskComments';
import { Drawer } from '@/shared/ui/Drawer';

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    listName: string;
    onUpdateTask: (taskId: string, data: Partial<Task>) => void;
    isUpdating: boolean;
    workspaceMembers: any[];
    boardTasks: Task[];
    isViewer: boolean;
    canManageTask: boolean;
    canDeleteTask: boolean;
    canAssignTask: boolean;
    subteams: any[];
    currentUserRole: string;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
    isOpen, 
    onClose, 
    task, 
    listName,
    onUpdateTask,
    isUpdating,
    workspaceMembers,
    boardTasks,
    isViewer,
    canManageTask,
    canDeleteTask,
    canAssignTask,
    subteams,
    currentUserRole
}) => {
    // Nếu không có task, không render
    if (!isOpen || !task) return null;

    // Lấy actions từ hook (để gọi API comments, file, delete)
    const boardActions = useBoardActions(task.boardId);

    // Query lấy danh sách bình luận (chỉ cho TaskDetailModal)
    const { data: comments = [], isLoading: isLoadingComments } = useQuery({
        queryKey: ['task', task._id, 'comments'],
        queryFn: () => boardApi.getComments(task._id),
        enabled: !!task._id,
    });

    const handleUpdateTaskData = (data: Partial<Task>) => {
        onUpdateTask(task._id, data);
    };

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            position="right"
            width="md"
            showCloseButton={false}
            className="p-0"
        >
            {/* Header (Top Action Bar & Title) */}
            <TaskHeader 
                taskTitle={task.title}
                listName={listName}
                taskOrder={task.order}
                taskType={task.type || 'Task'}
                isViewer={!canManageTask}
                canManageTask={canManageTask}
                isDeleting={boardActions.isDeletingTask}
                onUpdateTitle={(title) => handleUpdateTaskData({ title })}
                onClose={onClose}
            />

            {/* Main Scrollable Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-white dark:bg-[#0B0F19]/95">
                <div className="p-6 space-y-8 flex-1">
                    
                    <TaskProperties 
                        task={task}
                        boardTasks={boardTasks}
                        workspaceMembers={workspaceMembers}
                        isViewer={!canManageTask}
                        canAssignTask={canAssignTask}
                        subteams={subteams}
                        currentUserRole={currentUserRole}
                        onUpdateTask={(data) => handleUpdateTaskData(data)}
                        onFillBugTemplate={(template) => handleUpdateTaskData({ description: template })}
                    />

                    <TaskAttachments 
                        taskId={task._id}
                        attachments={task.attachments || []}
                        isUploading={boardActions.isUploadingFile}
                        onUploadFile={(file) => boardActions.uploadFile({ taskId: task._id, file })}
                        canUpload={canManageTask}
                    />
                    
                    <TaskDescription 
                        description={task.description || ''}
                        isViewer={!canManageTask}
                        isUpdating={isUpdating}
                        onUpdateDescription={(description) => handleUpdateTaskData({ description })}
                    />

                    <TaskChecklists 
                        checklists={task.checklists || []}
                        isViewer={!canManageTask}
                        onUpdateChecklists={(checklists) => handleUpdateTaskData({ checklists })}
                    />

                    <TaskComments 
                        comments={comments}
                        workspaceMembers={workspaceMembers}
                        isLoading={isLoadingComments}
                        isCreatingComment={boardActions.isCreatingComment}
                        onCreateComment={(content: string) => boardActions.createComment({ taskId: task._id, content })}
                        onDeleteComment={(commentId: string) => boardActions.deleteComment({ taskId: task._id, commentId })}
                        isDeletingComment={boardActions.isDeletingComment}
                    />

                </div>
            </div>
        </Drawer>
    );
};
