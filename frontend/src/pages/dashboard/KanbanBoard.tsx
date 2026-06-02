import React from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Task } from '@/features/board/api/board.api';
import { TaskDetailModal } from '@/features/board/components/TaskDetailModal';
import { BoardHeader } from '@/features/board/components/BoardHeader'; // Vite reload
import { BoardSettingsDrawer } from '@/features/board/components/BoardSettingsDrawer';
import { BoardColumn } from '@/features/board/components/BoardColumn';
import { PlanView } from '@/features/board/components/PlanView';
import { CommandPalette } from '@/features/board/components/CommandPalette';
import { Button } from '@/shared/ui/Button';
import { Loader2, Plus, X, Kanban, List, Command, Sparkles } from 'lucide-react';
import { useKanbanLogic } from '@/features/board/hooks/useKanbanLogic';
import { AIGenerateModal } from '@/features/board/components/AIGenerateModal';

export const KanbanBoard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [isAIModalOpen, setIsAIModalOpen] = React.useState(false);
    
    const {
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
    } = useKanbanLogic(id);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!localBoard) return <div className="p-8">Không tìm thấy Bảng Kanban!</div>;

    return (
        <div className="flex flex-col h-screen overflow-hidden relative transition-colors duration-500 -m-8 bg-slate-50 dark:bg-[#0B0F19]">
            {/* 3D Glowing Background Orbs (Deep Space Effect) */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-300/30 dark:bg-blue-600/10 blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-300/30 dark:bg-indigo-600/10 blur-[140px] pointer-events-none" />
            <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-purple-300/20 dark:bg-purple-600/5 blur-[120px] pointer-events-none" />

            {/* Relative container for content */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Board Header Toolbars */}
                <BoardHeader
                    board={localBoard}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedAssignees={selectedAssignees}
                    setSelectedAssignees={setSelectedAssignees}
                    selectedComponent={selectedComponent}
                    setSelectedComponent={setSelectedComponent}
                    currentUserRole={currentUserRole}
                    canEditBoard={canEditBoard}
                />

                {/* Filter Warning */}
                {isFilterActive && viewMode === 'kanban' && (
                    <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm px-6 py-2 flex items-center justify-center gap-2 font-medium border-b border-amber-200 dark:border-amber-800">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Kéo thả thẻ tạm thời bị vô hiệu hóa khi đang sử dụng Bộ lọc.
                    </div>
                )}

                {/* View Mode Toggle */}
                <div className="px-8 pt-4 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-200/50 dark:bg-white/5 p-1 rounded-lg backdrop-blur-sm">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-[#151A26] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10'}`}
                            >
                                <Kanban size={16} /> Board
                            </button>
                            <button
                                onClick={() => setViewMode('plan')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${viewMode === 'plan' ? 'bg-white dark:bg-[#151A26] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/10'}`}
                            >
                                <List size={16} /> Tree Plan
                            </button>
                        </div>
                        
                        {canManageColumns && (
                            <button 
                                onClick={() => setIsAIModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Sparkles size={16} /> AI Generate
                            </button>
                        )}
                    </div>

                    {/* Command Palette Hint */}
                    <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                        onClick={() => setIsCmdPaletteOpen(true)}
                        title="Mở bảng lệnh (Command Palette)"
                    >
                        <Command size={14} />
                        <span className="text-[11px] font-bold tracking-wider uppercase">Menu Lệnh</span>
                        <kbd className="ml-1 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-[9px] font-mono font-bold shadow-sm">⌘ K</kbd>
                    </button>
                </div>

                {/* Board Canvas (Drag & Drop Context) */}
                {viewMode === 'kanban' ? (
                    <div className="flex-1 overflow-x-auto overflow-y-hidden px-8 pb-8 custom-scrollbar">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="board" type="list" direction="horizontal">
                                {(provided) => (
                                    <div
                                        className="flex items-start gap-6 h-full"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {localBoard.lists?.map((list, index) => (
                                            <BoardColumn
                                                key={list._id}
                                                list={list}
                                                index={index}
                                                boardId={id!}
                                                onTaskClick={(task: Task) => handleOpenTaskDetail(task, list.title)}
                                                isFilterActive={isFilterActive}
                                                searchQuery={searchQuery}
                                                selectedAssignees={selectedAssignees}
                                                selectedComponent={selectedComponent}
                                                allTasks={localBoard.lists?.flatMap(l => l.tasks) || []}
                                                isViewer={isViewer}
                                                canCreateTask={canCreateTask}
                                                canManageColumns={canManageColumns}
                                                canDeleteTask={canDeleteTask}
                                                canMoveTask={canMoveTask}
                                                workspaceMembers={localBoard?.workspace?.members || []}
                                            />
                                        ))}
                                        {provided.placeholder}

                                        {/* Add New Column Form */}
                                        {canManageColumns && (
                                            isCreatingList ? (
                                                <div className="flex-shrink-0 w-80 p-3 bg-white dark:bg-[#111520] rounded-2xl border border-blue-500 shadow-xl shadow-blue-500/10">
                                                    <form onSubmit={handleCreateList}>
                                                        <input
                                                            type="text"
                                                            autoFocus
                                                            value={newListName}
                                                            onChange={(e) => setNewListName(e.target.value)}
                                                            placeholder="Nhập tên cột..."
                                                            className="w-full text-sm px-3 py-2 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:border-blue-500 transition-colors mb-3 dark:text-white"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <Button type="submit" size="sm" isLoading={boardActions.isCreatingList}>
                                                                Thêm cột
                                                            </Button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsCreatingList(false)}
                                                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setIsCreatingList(true)}
                                                    className="flex-shrink-0 w-80 h-14 flex items-center gap-2 px-4 rounded-2xl bg-white/40 hover:bg-white/60 dark:bg-black/20 dark:hover:bg-black/40 text-slate-800 hover:text-slate-900 dark:text-white dark:hover:text-white backdrop-blur-md shadow-sm transition-all font-semibold"
                                                >
                                                    <Plus size={20} /> Thêm cột mới
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                ) : (
                    <PlanView
                        board={localBoard}
                        onTaskClick={handleOpenTaskDetail}
                        onUpdateTask={handleUpdateTask}
                        searchQuery={searchQuery}
                        selectedAssignees={selectedAssignees}
                        selectedComponent={selectedComponent}
                    />
                )}

                {!!selectedTask && (
                    <TaskDetailModal
                        isOpen={!!selectedTask}
                        onClose={() => setSelectedTask(null)}
                        task={selectedTask}
                        listName={selectedListName}
                        onUpdateTask={handleUpdateTask}
                        isUpdating={boardActions.isUpdatingTask}
                        workspaceMembers={localBoard?.workspace?.members || []}
                        boardTasks={localBoard?.lists?.flatMap(l => l.tasks) || []}
                        isViewer={isViewer}
                        canManageTask={canEditTask} // passed to detail modal for edit permissions
                        canDeleteTask={canDeleteTask}
                        canAssignTask={canAssignTask}
                        subteams={subteams || []}
                        currentUserRole={currentUserRole}
                    />
                )}

                {/* Settings Drawer */}
                <BoardSettingsDrawer
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    board={localBoard}
                    onUpdateBackground={handleUpdateBackground}
                    isUpdating={boardActions.isUpdatingBoard}
                    canEditBoard={canEditBoard}
                    canDeleteBoard={canDeleteBoard}
                />

                <CommandPalette
                    isOpen={isCmdPaletteOpen}
                    onClose={() => setIsCmdPaletteOpen(false)}
                    tasks={localBoard.lists?.flatMap(l => l.tasks) || []}
                    onUpdateTask={handleUpdateTask}
                    onOpenTask={(task) => {
                        const list = localBoard.lists?.find(l => l.tasks.some(t => t._id === task._id));
                        setSelectedTask(task);
                        setSelectedListName(list?.title || '');
                    }}
                />

                <AIGenerateModal 
                    isOpen={isAIModalOpen}
                    onClose={() => setIsAIModalOpen(false)}
                    boardId={id!}
                    workspaceMembers={localBoard?.workspace?.members || []}
                />
            </div>
        </div>
    );
};

export default KanbanBoard;
