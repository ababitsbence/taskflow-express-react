import api from './client';

export const getCategories = () => {
    return api.get('/categories');
};

export const createCategory = (name) => {
    return api.post('/categories', { name });
};

export const deleteCategory = (id) => {
    return api.delete(`/categories/${id}`);
};