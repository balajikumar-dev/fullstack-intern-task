import api from './api';
export const login = async (credentials) => (await api.post('/auth/login', credentials)).data;
export const register = async (details) => (await api.post('/auth/register', details)).data;
export const getCurrentUser = async () => (await api.get('/auth/me')).data.user;
