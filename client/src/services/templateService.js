import api from './api';
export const getTemplates = async (signal) =>
  (await api.get('/templates', { signal })).data.templates;
export const getTemplate = async (id, signal) =>
  (await api.get(`/templates/${id}`, { signal })).data.template;
