import api from '@/lib/api'
import { User } from '@/store/authStore'

// ─── Auth ────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<{ success: boolean; data: { accessToken: string; user: User } }>('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  refreshToken: () =>
    api.post<{ success: boolean; data: { accessToken: string } }>('/auth/refresh-token'),

  verifyEmail: (token: string) =>
    api.get(`/auth/verify-email?token=${token}`),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  googleLogin: () =>
    api.post<{ success: boolean; data: { accessToken: string; user: User } }>('/auth/google'),

  getMe: () =>
    api.get<{ success: boolean; data: { user: User } }>('/auth/me'),
}

// ─── User ────────────────────────────────────────────────

export const userApi = {
  getProfile: () => api.get('/users/profile'),
  getDashboard: () => api.get('/users/dashboard'),
  updateProfile: (data: Partial<User>) => api.patch('/users/profile', data),
  uploadAvatar: (formData: FormData) =>
    api.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/users/change-password', data),
  deleteAccount: () => api.delete('/users/account'),
  getSkills: () => api.get('/users/skills'),
  addSkill: (name: string, proficiency: number) =>
    api.post('/users/skills', { name, proficiency }),
  deleteSkill: (id: string) => api.delete(`/users/skills/${id}`),
}

// ─── Resume ──────────────────────────────────────────────

export const resumeApi = {
  upload: (formData: FormData) =>
    api.post('/resumes', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: () => api.get('/resumes'),
  getById: (id: string) => api.get(`/resumes/${id}`),
  setActive: (id: string) => api.patch(`/resumes/${id}/set-active`),
  reanalyze: (id: string) => api.post(`/resumes/${id}/reanalyze`),
  delete: (id: string) => api.delete(`/resumes/${id}`),
}

// ─── Interview ───────────────────────────────────────────

export const interviewApi = {
  create: (data: {
    type: string
    difficulty: string
    totalQuestions: number
    customTopic?: string
    title?: string
  }) => api.post('/interviews', data),

  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/interviews', { params }),

  getById: (id: string) => api.get(`/interviews/${id}`),
  start: (id: string) => api.post(`/interviews/${id}/start`),
  submitAnswer: (id: string, data: { questionId: string; transcript: string; duration?: number }) =>
    api.post(`/interviews/${id}/answer`, data),
  complete: (id: string) => api.post(`/interviews/${id}/complete`),
  getFeedback: (id: string) => api.get(`/interviews/${id}/feedback`),
  delete: (id: string) => api.delete(`/interviews/${id}`),
}

// ─── Analytics ───────────────────────────────────────────

export const analyticsApi = {
  getAnalytics: () => api.get('/analytics'),
}

// ─── Admin ───────────────────────────────────────────────

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/admin/users', { params }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
}
