import axios from 'axios';
import { Platform } from 'react-native';

// Use the exact local Wi-Fi IP so the physical device/emulator can reach the backend
const API_URL = 'http://192.168.0.5:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHabits = () => api.get('/habits');
export const createHabit = (data) => api.post('/habits', data);
export const updateHabit = (id, data) => api.put(`/habits/${id}`, data);
export const deleteHabit = (id) => api.delete(`/habits/${id}`);

export const logHabit = (data) => api.post('/habits/log', data);
export const getTodayHabits = () => api.get('/habits/today');
export const getWeeklyStats = () => api.get('/habits/week');

export const getTasks = (params) => api.get('/tasks', { params });
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

export default api;
