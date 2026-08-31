import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';

function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editStatus, setEditStatus] = useState('');

    const fetchTasks = async () => {
        try {
            const response = await getTasks();
            setTasks(response.data);
        } catch (err) {
            setError('Failed to load tasks');
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            await createTask({ title, status: 'todo' });
            setTitle('');
            fetchTasks();
        } catch (err) {
            setError('Failed to create task');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteTask(id);
            fetchTasks();
        } catch (err) {
            setError('Failed to delete task');
        }
    };

    const startEditing = (task) => {
        setEditingId(task.id);
        setEditTitle(task.title);
        setEditStatus(task.status);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditTitle('');
        setEditStatus('');
    };

    const handleUpdate = async (id) => {
        if (!editTitle.trim()) return;

        try {
            await updateTask(id, { title: editTitle, status: editStatus });
            cancelEditing();
            fetchTasks();
        } catch (err) {
            setError('Failed to update task');
        }
    };

    return (
        <div>
            <h1>Dashboard</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleCreate}>
                <input
                    type="text"
                    placeholder="New task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <button type="submit">Add Task</button>
            </form>

            <ul>
                {tasks.map((task) =>
                    editingId === task.id ? (
                        <li key={task.id}>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                            />
                            <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                            >
                                <option value="todo">todo</option>
                                <option value="in-progress">in-progress</option>
                                <option value="done">done</option>
                            </select>
                            <button onClick={() => handleUpdate(task.id)}>Save</button>
                            <button onClick={cancelEditing}>Cancel</button>
                        </li>
                    ) : (
                        <li key={task.id}>
                            {task.title} — {task.status}
                            <button onClick={() => startEditing(task)}>Edit</button>
                            <button onClick={() => handleDelete(task.id)}>Delete</button>
                        </li>
                    )
                )}
            </ul>
        </div>
    );
}

export default Dashboard;