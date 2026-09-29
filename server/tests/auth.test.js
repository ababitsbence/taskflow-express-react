const request = require('supertest');
const app = require('../app');
const pool = require('../db');

const testUser = {
    email: 'auth-test@example.com',
    password: 'testpass123',
};

afterAll(async () => {
    await pool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
    await pool.end();
});

describe('POST /auth/register', () => {
    test('registers a new user and does not return the password hash', async () => {
        const res = await request(app).post('/auth/register').send(testUser);

        expect(res.status).toBe(201);
        expect(res.body.email).toBe(testUser.email);
        expect(res.body.password_hash).toBeUndefined();
    });

    test('rejects a duplicate email', async () => {
        const res = await request(app).post('/auth/register').send(testUser);

        expect(res.status).toBe(409);
        expect(res.body.error).toBe('Email already registered');
    });

    test('rejects a missing password', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'no-password@example.com' });

        expect(res.status).toBe(400);
    });
});

describe('POST /auth/login', () => {
    test('logs in with correct credentials and returns a token', async () => {
        const res = await request(app).post('/auth/login').send(testUser);

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe(testUser.email);
    });

    test('rejects a wrong password', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: testUser.email, password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Invalid email or password');
    });

    test('rejects a nonexistent email', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'nobody@example.com', password: 'whatever123' });

        expect(res.status).toBe(401);
    });
});