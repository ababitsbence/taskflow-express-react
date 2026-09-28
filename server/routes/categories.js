const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

router.post('/', async (req, res) => {
    const name = req.body.name?.trim();

    if (!name) {
        return res.status(400).json({ error: 'name is required' });
    }
    if (name.length > 50) {
        return res.status(400).json({ error: 'name must be 50 characters or fewer' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING *',
            [req.user.id, name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING *',
            [req.params.id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ message: 'Category deleted', category: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

module.exports = router;