const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', async (req, res) => {
    const { category_id, title, description, status } = req.body;
    const user_id = req.user.id;

    if (!title || !status) {
        return res.status(400).json({ error: 'title and status are required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO tasks (user_id, category_id, title, description, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [user_id, category_id || null, title, description || '', status]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { category_id, title, description, status } = req.body;

    if (!title || !status) {
        return res.status(400).json({ error: 'title and status are required' });
    }

    try {
        const result = await pool.query(
            `UPDATE tasks
             SET category_id = $1, title = $2, description = $3, status = $4
             WHERE id = $5 AND user_id = $6
             RETURNING *`,
            [category_id || null, title, description || '', status, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted', task: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

module.exports = router;