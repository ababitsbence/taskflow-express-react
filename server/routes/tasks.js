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

module.exports = router;