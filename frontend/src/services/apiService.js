import api from './api';

// ==================== AUTH API ====================
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (data) => api.post('/api/auth/register', data),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
};

// ==================== SUBJECTS API ====================
export const subjectsAPI = {
  getAll: () => api.get('/api/subjects'),
  getById: (id) => api.get(`/api/subjects/${id}`),
  create: (data) => api.post('/api/subjects', data),
  update: (id, data) => api.put(`/api/subjects/${id}`, data),
  delete: (id) => api.delete(`/api/subjects/${id}`),
  getUnits: (id) => api.get(`/api/subjects/${id}/units`),
};

// ==================== UNITS API ====================
export const unitsAPI = {
  create: (subjectId, data) => api.post(`/api/subjects/${subjectId}/units`, data),
  update: (subjectId, unitId, data) => api.put(`/api/subjects/${subjectId}/units/${unitId}`, data),
  delete: (subjectId, unitId) => api.delete(`/api/subjects/${subjectId}/units/${unitId}`),
};

// ==================== NOTES API ====================
export const notesAPI = {
  getAll: (params) => api.get('/api/notes', { params }),
  getById: (id) => api.get(`/api/notes/${id}`),
  create: (formData) => api.post('/api/notes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/api/notes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/api/notes/${id}`),
  search: (query) => api.get('/api/notes/search', { params: { query } }),
  rate: (id, rating) => api.post(`/api/notes/${id}/rate`, { rating }),
  examMode: () => api.get('/api/notes/exam-mode'),
  addTag: (id, tag) => api.post(`/api/notes/${id}/tags`, { tag }),
  removeTag: (id, tag) => api.delete(`/api/notes/${id}/tags/${tag}`),
};

// ==================== ASSIGNMENTS API ====================
export const assignmentsAPI = {
  getAll: (params) => api.get('/api/assignments', { params }),
  getById: (id) => api.get(`/api/assignments/${id}`),
  create: (data) => api.post('/api/assignments', data),
  update: (id, data) => api.put(`/api/assignments/${id}`, data),
  delete: (id) => api.delete(`/api/assignments/${id}`),
  submit: (id, formData) => api.post(`/api/assignments/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  grade: (id, submissionId, data) => api.put(`/api/assignments/${id}/submissions/${submissionId}/grade`, data),
  getSubmissions: (id) => api.get(`/api/assignments/${id}/submissions`),
};

// ==================== TIMETABLE API ====================
export const timetableAPI = {
  getAll: () => api.get('/api/timetable'),
  create: (data) => api.post('/api/timetable', data),
  update: (id, data) => api.put(`/api/timetable/${id}`, data),
  delete: (id) => api.delete(`/api/timetable/${id}`),
  getWeekly: () => api.get('/api/timetable/weekly'),
};

// ==================== PROGRESS API ====================
export const progressAPI = {
  getAll: () => api.get('/api/progress'),
  getBySubject: (subjectId) => api.get(`/api/progress/subject/${subjectId}`),
  markComplete: (data) => api.post('/api/progress/mark-complete', data),
  updateConfidence: (data) => api.put('/api/progress/confidence', data),
  getStats: () => api.get('/api/progress/stats'),
};

// ==================== ANNOUNCEMENTS API ====================
export const announcementsAPI = {
  getAll: () => api.get('/api/announcements'),
  getById: (id) => api.get(`/api/announcements/${id}`),
  create: (data) => api.post('/api/announcements', data),
  update: (id, data) => api.put(`/api/announcements/${id}`, data),
  delete: (id) => api.delete(`/api/announcements/${id}`),
  markRead: (id) => api.put(`/api/announcements/${id}/read`),
};

export default {
  auth: authAPI,
  subjects: subjectsAPI,
  units: unitsAPI,
  notes: notesAPI,
  assignments: assignmentsAPI,
  timetable: timetableAPI,
  progress: progressAPI,
  announcements: announcementsAPI,
};
