import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'charpynterhair.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request interceptor to:
 * 1. Attach Authorization header with adminToken
 * 2. Attach X-Request-Nonce and X-Request-Timestamp for mutative requests (Anti-Replay)
 */
api.interceptors.request.use(
  async (config) => {
    try {
      // 1. Attach JWT Access Token if present
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 2. Generate Nonce & Timestamp for POST, PUT, DELETE, PATCH (Anti-Replay)
      const method = config.method?.toLowerCase() || '';
      if (['post', 'put', 'delete', 'patch'].includes(method)) {
        const nonce = self.crypto.randomUUID
          ? self.crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        config.headers['X-Request-Nonce'] = nonce;
        config.headers['X-Request-Timestamp'] = Date.now().toString();
      }

      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - automatic token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // Se erro 401 e ainda não tentou refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Se já tentou refresh muitas vezes, desiste
      if (originalRequest._retryCount && originalRequest._retryCount >= 3) {
        // Limpa tokens e redireciona para login
        localStorage.removeItem('adminToken');
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
        return Promise.reject(error);
      }

      // Se já está fazendo refresh, adiciona à fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      isRefreshing = true;

      try {
        // Tenta fazer refresh do token
        // Como o refresh token está em cookie httpOnly, precisamos fazer a requisição
        // sem especificar o refresh token manualmente
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3333'}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        const newToken = response.data.accessToken;
        localStorage.setItem('adminToken', newToken);

        processQueue(null, newToken);

        // Repete a requisição original com o novo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Se falhar o refresh, limpa tokens e redireciona
        localStorage.removeItem('adminToken');
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * API endpoints for Auth, Galeria, Catalogo, Leads and Configuracoes
 */
export const apiAuth = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  refreshToken: (data: any) => api.post('/auth/refresh', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.put('/auth/change-password', data),
  changeEmail: (data: { newEmail: string }) => api.put('/auth/change-email', data),
  forgotPassword: (data: { email: string }) => api.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; newPassword: string }) => api.post('/auth/reset-password', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (data: { email: string }) => api.post('/auth/resend-verification', data),
};

export const apiGaleria = {
  findAll: () => api.get('/galeria'),
  create: (data: any) => api.post('/galeria', data),
  update: (id: string, data: any) => api.put(`/galeria/${id}`, data),
  remove: (id: string) => api.delete(`/galeria/${id}`),
};

export const apiCatalogo = {
  findAll: () => api.get('/catalogo'),
  create: (data: any) => api.post('/catalogo', data),
  update: (id: string, data: any) => api.put(`/catalogo/${id}`, data),
  remove: (id: string) => api.delete(`/catalogo/${id}`),
};

export const apiLeads = {
  findAll: () => api.get('/leads'),
  create: (data: any) => api.post('/leads', data),
  update: (id: string, data: any) => api.put(`/leads/${id}`, data),
  remove: (id: string) => api.delete(`/leads/${id}`),
};

export const apiConfiguracoes = {
  find: () => api.get('/configuracoes'),
  update: (data: any) => api.put('/configuracoes', data),
};

export default api;
