import api from './api.js';

const taskService = {
  /**
   * params: { search, status, priority, sortBy, direction }
   * Values that are empty or "ALL" are left out so the backend returns everything.
   */
  getTasks(params = {}) {
    const query = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
        query[key] = value;
      }
    });
    return api.get('/tasks', { params: query }).then((response) => response.data);
  },

  getTask(id) {
    return api.get(`/tasks/${id}`).then((response) => response.data);
  },

  getStats() {
    return api.get('/tasks/stats').then((response) => response.data);
  },

  createTask(task) {
    return api.post('/tasks', task).then((response) => response.data);
  },

  updateTask(id, task) {
    return api.put(`/tasks/${id}`, task).then((response) => response.data);
  },

  deleteTask(id) {
    return api.delete(`/tasks/${id}`);
  },

  completeTask(id) {
    return api.patch(`/tasks/${id}/complete`).then((response) => response.data);
  },

  updateStatus(id, status) {
    return api.patch(`/tasks/${id}/status`, { status }).then((response) => response.data);
  }
};

export default taskService;
