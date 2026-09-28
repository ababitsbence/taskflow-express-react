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
        opacity: isDragging ? 0.7 : 1,
        position: 'relative',
        zIndex: isDragging ? 10 : undefined,
        background: 'Canvas',
        border: '1px solid #666',
        borderRadius: 6,
        padding: 8,
        marginBottom: 8,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <button
                ref={setActivatorNodeRef}
                {...listeners}
                {...attributes}
                style={{ cursor: 'grab', touchAction: 'none' }}
                aria-label="Drag task"
            >
                ⠿
            </button>
            {children}
        </div>
    );
}

function Column({ id, label, count, children }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{
                flex: 1,
                minWidth: 220,
                minHeight: 200,
                padding: 8,
                border: `2px ${isOver ? 'dashed' : 'solid'} ${isOver ? '#888' : 'transparent'}`,
            }}
        >
            <h3>{label} ({count})</h3>
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
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
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