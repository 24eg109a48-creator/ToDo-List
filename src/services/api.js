import axios from 'axios';

// Keys used to remember the logged-in user in the browser.
export const TOKEN_KEY = 'smarttask_token';
export const USER_KEY = 'smarttask_user';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// One shared Axios instance: every service file uses this, so the base URL
// and the JWT header are configured in exactly one place.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Before every request: attach "Authorization: Bearer <token>" if we have a token.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// After every response: if the server says 401 (token missing/expired/invalid),
// forget the session and send the user to the login page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthRequest = url.includes('/auth/'); // wrong credentials should stay on the login/register page

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
