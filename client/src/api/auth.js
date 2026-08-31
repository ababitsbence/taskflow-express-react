import api from './client';

export const register = (email, password) => {
    return api.post('/auth/register', { email, password });
};

export const login = (email, password) => {
    return api.post('/auth/login', { email, password });
};