import api from './api';
export const getFavorites = async () => (await api.get('/favorites')).data.templates;
export const addFavorite = async (id) => (await api.post(`/favorites/${id}`)).data;
export const removeFavorite = async (id) => (await api.delete(`/favorites/${id}`)).data;
