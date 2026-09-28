import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { getCategories, createCategory, deleteCategory } from '../api/categories';
import TaskBoard from '../components/TaskBoard';
import ErrorBanner from '../components/ErrorBanner';

function Dashboard() {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');

    const [categoryName, setCategoryName] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [editCategoryId, setEditCategoryId] = useState('');

    const [filterCategory, setFilterCategory] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');

    const fetchTasks = async () => {
        try {
            const response = await getTasks();
            setTasks(response.data);
        } catch (err) {
            setError('Failed to load tasks');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getCategories();
            setCategories(response.data);
        } catch (err) {
            setError('Failed to load categories');
        }
    };

    useEffect(() => {
        Promise.all([fetchTasks(), fetchCategories()]).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!error) return;
        const timer = setTimeout(() => setError(''), 5000);
        return () => clearTimeout(timer);
    }, [error]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            await createTask({
                title,
                status: 'todo',
                category_id: categoryId ? Number(categoryId) : null,
            });
            setTitle('');
            setCategoryId('');
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
        setEditCategoryId(task.category_id ? String(task.category_id) : '');
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditTitle('');
        setEditStatus('');
        setEditCategoryId('');
    };

    const handleUpdate = async (id) => {
        if (!editTitle.trim()) return;

        const task = tasks.find((t) => t.id === id);

        try {
            await updateTask(id, {
                title: editTitle,
                description: task?.description,
                status: editStatus,
                category_id: editCategoryId ? Number(editCategoryId) : null,
            });
            cancelEditing();
            fetchTasks();
        } catch (err) {
            setError('Failed to update task');
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!categoryName.trim()) return;

        try {
            await createCategory(categoryName.trim());
            setCategoryName('');
            fetchCategories();
        } catch (err) {
            setError('Failed to create category');
        }
    };

    const handleDeleteCategory = async (id) => {
        try {
            await deleteCategory(id);
            if (filterCategory === String(id)) setFilterCategory('all');
            fetchCategories();
            fetchTasks();
        } catch (err) {
            setError('Failed to delete category');
        }
    };

    const handleMove = async (task, newStatus) => {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));

        try {
            await updateTask(task.id, {
                title: task.title,
                description: task.description,
                category_id: task.category_id,
                status: newStatus,
            });
        } catch (err) {
            setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)));
            setError('Failed to move task');
        }
    };

    const getCategoryName = (id) => {
        return categories.find((c) => c.id === id)?.name || 'Uncategorized';
    };

    const visibleTasks = tasks
        .filter((t) => {
            if (filterCategory === 'all') return true;
            if (filterCategory === 'none') return t.category_id === null;
            return t.category_id === Number(filterCategory);
        })
        .sort((a, b) =>
            sortOrder === 'newest'
                ? new Date(b.created_at) - new Date(a.created_at)
                : new Date(a.created_at) - new Date(b.created_at)
        );

    const renderTask = (task) =>
        editingId === task.id ? (
            <div className="edit-form">
                <input
                    type="text"
                    maxLength={100}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                />
                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    <option value="todo">todo</option>
                    <option value="in-progress">in-progress</option>
                    <option value="done">done</option>
                </select>
                <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)}>
                    <option value="">No category</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <div className="task-actions">
                    <button onClick={() => handleUpdate(task.id)}>Save</button>
                    <button className="secondary" onClick={cancelEditing}>Cancel</button>
                </div>
            </div>
        ) : (
            <div>
                <strong className="task-title">{task.title}</strong>
                <span className="badge">{getCategoryName(task.category_id)}</span>
                <div className="task-actions">
                    <button className="secondary" onClick={() => startEditing(task)}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(task.id)}>Delete</button>
                </div>
            </div>
        );

    return (
        <div className="container">
            <header className="page-header">
                <h1>Dashboard</h1>
                <button className="secondary" onClick={handleLogout}>Log out</button>
            </header>

            <ErrorBanner message={error} onDismiss={() => setError('')} />

            <section className="panel">
                <h2>Categories</h2>
                <form className="row" onSubmit={handleCreateCategory}>
                    <input
                        type="text"
                        placeholder="New category name"
                        maxLength={50}
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                    />
                    <button type="submit">Add Category</button>
                </form>
                {!loading && categories.length === 0 && (
                    <p className="empty-column">No categories yet. Add one above.</p>
                )}
                <ul className="chips">
                    {categories.map((c) => (
                        <li key={c.id} className="chip">
                            {c.name}
                            <button
                                onClick={() => handleDeleteCategory(c.id)}
                                aria-label={`Delete category ${c.name}`}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="panel">
                <h2>New task</h2>
                <form className="row" onSubmit={handleCreate}>
                    <input
                        type="text"
                        placeholder="New task title"
                        maxLength={100}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                        <option value="">No category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <button type="submit">Add Task</button>
                </form>
            </section>

            <div className="row toolbar">
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option value="all">All categories</option>
                    <option value="none">Uncategorized</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                </select>
            </div>

            {loading ? (
                <div className="spinner" role="status" aria-label="Loading tasks" />
            ) : tasks.length === 0 ? (
                <p className="empty-state">No tasks yet. Add your first task above.</p>
            ) : visibleTasks.length === 0 ? (
                <p className="empty-state">No tasks match this filter.</p>
            ) : (
                <TaskBoard tasks={visibleTasks} onMove={handleMove} renderTask={renderTask} />
            )}
        </div>
    );
}

export default Dashboard;