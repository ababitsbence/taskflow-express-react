const request = require('supertest');
const app = require('../app');

async function createUserAndLogin(email, password = 'testpass123') {
    await request(app).post('/auth/register').send({ email, password });
    const res = await request(app).post('/auth/login').send({ email, password });
    return { token: res.body.token, userId: res.body.user.id };
}

module.exports = { createUserAndLogin };