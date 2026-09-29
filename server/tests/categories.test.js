const request = require('supertest');
const app = require('../app');
const pool = require('../db');
const { createUserAndLogin } = require('./helpers');

let token;
const userEmail = 'categories-test@example.com';

beforeAll(async () => {
    const user = await createUserAndLogin(userEmail);
    token = user.token;
});

afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [userEmail]);
    await pool.end();
});

describe('POST /categories', () => {
    test('rejects a request with no token', async () => {
        const res = await request(app).post('/categories').send({ name: 'Work' });
        expect(res.status).toBe(401);
    });

    test('rejects a missing name', async () => {
        const res = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({});

        expect(res.status).toBe(400);
    });

    test('rejects a name over 50 characters', async () => {
        const res = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'x'.repeat(51) });

        expect(res.status).toBe(400);
    });

    test('creates a category owned by the logged-in user', async () => {
        const res = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Work' });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Work');
    });
});

describe('GET /categories', () => {
    test('lists only the logged-in user\'s categories', async () => {
        const res = await request(app).get('/categories').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.some((c) => c.name === 'Work')).toBe(true);
    });
});

describe('DELETE /categories/:id', () => {
    let categoryId;

    beforeAll(async () => {
        const res = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Temporary' });
        categoryId = res.body.id;
    });

    test('deletes a category', async () => {
        const res = await request(app)
            .delete(`/categories/${categoryId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
    });

    test('returns 404 for a nonexistent category', async () => {
        const res = await request(app)
            .delete('/categories/999999')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
    });
});

describe('ownership isolation between users', () => {
    let otherToken;
    let categoryId;
    const otherEmail = 'categories-test-other@example.com';

    beforeAll(async () => {
        const owner = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Owned by first user' });
        categoryId = owner.body.id;

        const other = await createUserAndLogin(otherEmail);
        otherToken = other.token;
    });

    afterAll(async () => {
        await pool.query('DELETE FROM users WHERE email = $1', [otherEmail]);
    });

    test('a different user cannot delete someone else\'s category', async () => {
        const res = await request(app)
            .delete(`/categories/${categoryId}`)
            .set('Authorization', `Bearer ${otherToken}`);

        expect(res.status).toBe(404);
    });

    test('a task cannot use another user\'s category_id', async () => {
        const res = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${otherToken}`)
            .send({ title: 'Sneaky', status: 'todo', category_id: categoryId });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid category');
    });
});