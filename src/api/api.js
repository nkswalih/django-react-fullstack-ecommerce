// api/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000"; // ← only this line changes

export const api = {
  getAll: (endpoint) => axios.get(`${API_BASE}/${endpoint}`),

  getById: (endpoint, id) => axios.get(`${API_BASE}/${endpoint}/${id}`),

  create: (endpoint, data) => axios.post(`${API_BASE}/${endpoint}`, data),

  update: (endpoint, id, data) => 
    axios.put(`${API_BASE}/${endpoint}/${id}`, data),

  patch: (endpoint, id, data) => 
    axios.patch(`${API_BASE}/${endpoint}/${id}`, data),

  remove: (endpoint, id) => axios.delete(`${API_BASE}/${endpoint}/${id}`)
};