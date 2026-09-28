import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

const COLUMNS = [
    { id: 'todo', label: 'To do' },
    { id: 'in-progress', label: 'In progress' },
    { id: 'done', label: 'Done' },
];

function TaskCard({ task, children }) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } =
        useDraggable({ id: task.id });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        position: 'relative',
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`task-card${isDragging ? ' task-card-dragging' : ''}`}
        >
            <button
                ref={setActivatorNodeRef}
                {...listeners}
                {...attributes}
                className="drag-handle"
                aria-label="Drag task"
            >
                ⠿
            </button>
            <div className="task-body">{children}</div>
        </div>
    );
}

function Column({ id, label, count, children }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={`column${isOver ? ' column-over' : ''}`}>
            <h3>{label} ({count})</h3>
            {count === 0 && <p className="empty-column">Drop tasks here</p>}
            {children}
        </div>
    );
}

function TaskBoard({ tasks, onMove, renderTask }) {
    const handleDragEnd = ({ active, over }) => {
        if (!over) return;

        const task = tasks.find((t) => t.id === active.id);
        if (task && task.status !== over.id) {
            onMove(task, over.id);
        }
    };

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="board">
                {COLUMNS.map((col) => {
                    const columnTasks = tasks.filter((t) => t.status === col.id);
                    return (
                        <Column key={col.id} id={col.id} label={col.label} count={columnTasks.length}>
                            {columnTasks.map((task) => (
                                <TaskCard key={task.id} task={task}>
                                    {renderTask(task)}
                                </TaskCard>
                            ))}
                        </Column>
                    );
                })}
            </div>
        </DndContext>
    );
}

export default TaskBoard;