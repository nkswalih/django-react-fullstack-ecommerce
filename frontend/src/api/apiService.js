import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";

const api = axios.create({ baseURL: BASE_URL });

// ── Products ──────────────────────────────────────────────────────────────────
export const getProducts = () => api.get("/products/");
export const getProductById = (id) => api.get(`/products/${id}/`);
export const getProductBySlug = (slug) => api.get(`/products/${slug}/`);
export const patchProduct = (id, data) => api.patch(`/products/${id}/`, data);
export const createProduct = (data) => api.post("/products/", data);
export const deleteProduct = (id) => api.delete(`/products/${id}/`);
export const updateProduct = (id, data) => api.put(`/products/${id}/`, data);

// // ── Users ─────────────────────────────────────────────────────────────────────
// export const getUsers = () => api.get("/users/");
// export const getUserById = (id) => api.get(`/users/${id}/`);
// export const patchUser = (id, data) => api.patch(`/users/${id}/`, data);
// export const createUser = (data) => api.post("/users/", data);
// export const deleteUser = (id) => api.delete(`/users/${id}/`);
// export const updateUser = (id, data) => api.put(`/users/${id}/`, data);

// // ── Orders ────────────────────────────────────────────────────────────────────
// export const getOrders = () => api.get("/orders/");
// export const getOrderById = (id) => api.get(`/orders/${id}/`);
// export const createOrder = (data) => api.post("/orders/", data);
// export const patchOrder = (id, data) => api.patch(`/orders/${id}/`, data);
// export const deleteOrder = (id) => api.delete(`/orders/${id}/`);
// export const updateOrder = (id, data) => api.put(`/orders/${id}/`, data);


// TEMP MOCK (until backend ready)
export const createUser = async (data) => {
  console.log("Mock createUser:", data);
  return { data };
};
export const getUsers = async () => ({ data: [] });
export const getUserById = async () => ({ data: {} });
export const patchUser = async () => ({ data: {} });

export const getOrders = async () => ({ data: [] });
export const createOrder = async () => ({ data: {} });
export const patchOrder = async () => ({ data: {} });


export default api;
