import api from './client';

export const getTasks = () => {
    return api.get('/tasks');
};

export const createTask = (task) => {
    return api.post('/tasks', task);
};

export const updateTask = (id, task) => {
    return api.put(`/tasks/${id}`, task);
};

export const deleteTask = (id) => {
    return api.delete(`/tasks/${id}`);
};