const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    const { user_id, category_id, title, description, status } = req.body;

    if (!user_id || !title || !status) {
        return res.status(400).json({ error: 'user_id, title, and status are required' });
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
        const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

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
             WHERE id = $5
             RETURNING *`,
            [category_id || null, title, description || '', status, id]
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
            'DELETE FROM tasks WHERE id = $1 RETURNING *',
            [id]
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