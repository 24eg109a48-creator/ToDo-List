import api from './api.js';

const authService = {
  /** data: { name, email, password, confirmPassword } */
  register(data) {
    return api.post('/auth/register', data).then((response) => response.data);
  },

  /** data: { email, password }  ->  { token, tokenType, user } */
  login(data) {
    return api.post('/auth/login', data).then((response) => response.data);
  }
};

export default authService;
