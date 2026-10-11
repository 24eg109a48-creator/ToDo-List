import api from './api.js';

const userService = {
  getProfile() {
    return api.get('/users/profile').then((response) => response.data);
  },

  /** data: { name } */
  updateProfile(data) {
    return api.put('/users/profile', data).then((response) => response.data);
  }
};

export default userService;
