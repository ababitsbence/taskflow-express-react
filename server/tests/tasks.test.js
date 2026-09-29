const request = require('supertest');
const app = require('../app');
const pool = require('../db');
const { createUserAndLogin } = require('./helpers');

let token;
let userEmail = 'tasks-test@example.com';

beforeAll(async () => {
    const user = await createUserAndLogin(userEmail);
    token = user.token;
});

afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [userEmail]);
    await pool.end();
});

describe('POST /tasks', () => {
    test('rejects a request with no token', async () => {
        const res = await request(app).post('/tasks').send({ title: 'x', status: 'todo' });
        expect(res.status).toBe(401);
    });

    test('rejects a missing title', async () => {
        const res = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'todo' });

        expect(res.status).toBe(400);
    });

    test('creates a task owned by the logged-in user', async () => {
        const res = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Write tests', status: 'todo' });

        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Write tests');
        expect(res.body.status).toBe('todo');
    });

    test('rejects a category_id that does not belong to the user', async () => {
        const res = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Bad category', status: 'todo', category_id: 999999 });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid category');
    });
});

describe('GET /tasks and GET /tasks/:id', () => {
    let taskId;

    beforeAll(async () => {
        const res = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Fetch me', status: 'todo' });
        taskId = res.body.id;
    });

    test('lists only the logged-in user\'s tasks', async () => {
        const res = await request(app).get('/tasks').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some((t) => t.id === taskId)).toBe(true);
    });

    test('fetches a single task by id', async () => {
        const res = await request(app)
            .get(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.id).toBe(taskId);
    });

    test('returns 404 for a nonexistent task id', async () => {
        const res = await request(app)
            .get('/tasks/999999')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
    });
});

describe('PUT /tasks/:id', () => {
    let taskId;

    beforeAll(async () => {
        const res = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Before update', status: 'todo' });
        taskId = res.body.id;
    });

    test('updates title and status', async () => {
        const res = await request(app)
            .put(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'After update', status: 'done' });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('After update');
        expect(res.body.status).toBe('done');
    });

    test('returns 404 when updating a nonexistent task', async () => {
        const res = await request(app)
            .put('/tasks/999999')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'x', status: 'todo' });

        expect(res.status).toBe(404);
    });
});

describe('DELETE /tasks/:id', () => {
    test('deletes a task', async () => {
        const created = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Delete me', status: 'todo' });

        const res = await request(app)
            .delete(`/tasks/${created.body.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);

        const check = await request(app)
            .get(`/tasks/${created.body.id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(check.status).toBe(404);
    });

    test('returns 404 when deleting a nonexistent task', async () => {
        const res = await request(app)
            .delete('/tasks/999999')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
    });
});

describe('ownership isolation between users', () => {
    let otherToken;
    let ownerTaskId;
    const otherEmail = 'tasks-test-other@example.com';

    beforeAll(async () => {
        const owner = await request(app)
            .post('/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Owned by first user', status: 'todo' });
        ownerTaskId = owner.body.id;

        const other = await createUserAndLogin(otherEmail);
        otherToken = other.token;
    });

    afterAll(async () => {
        await pool.query('DELETE FROM users WHERE email = $1', [otherEmail]);
    });

    test('a different user cannot fetch someone else\'s task', async () => {
        const res = await request(app)
            .get(`/tasks/${ownerTaskId}`)
            .set('Authorization', `Bearer ${otherToken}`);

        expect(res.status).toBe(404);
    });

    test('a different user cannot delete someone else\'s task', async () => {
        const res = await request(app)
            .delete(`/tasks/${ownerTaskId}`)
            .set('Authorization', `Bearer ${otherToken}`);

        expect(res.status).toBe(404);
    });
});