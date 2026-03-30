import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";
const BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl : `${rawBaseUrl}/`;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const is401 = error.response?.status === 401;
    const isAuthRoute =
      originalRequest?.url?.includes("/login/") ||
      originalRequest?.url?.includes("/register/") ||
      originalRequest?.url?.includes("/token/refresh/");

    if (is401 && !isAuthRoute && !originalRequest?._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Cookie is sent automatically — no body needed
        await api.post("/token/refresh/");
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        window.location.href = "/sign_in";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const client = api;

// Auth
export const login = (data) => api.post("/login/", data);
export const register = (data) => api.post("/register/", data);
export const logout = () => api.post("/logout/");

// Profile
export const getProfile = () => api.get("/profile/");
export const updateProfile = (data) => api.patch("/profile/", data);

// Products
export const getProducts = (params) => api.get("/products/", { params });
export const getProductBySlug = (slug) => api.get(`/products/${slug}/`);
export const createProduct = (data) => api.post("/products/", data);
export const updateProduct = (slug, data) => api.put(`/products/${slug}/`, data);
export const patchProduct = (slug, data) => api.patch(`/products/${slug}/`, data);
export const deleteProduct = (slug) => api.delete(`/products/${slug}/`);

// Cart
export const getCart = () => api.get("/cart/");
export const addToCart = (data) => api.post("/cart/", data);
export const updateCartItem = (id, data) => api.patch(`/cart/${id}/`, data);
export const removeCartItem = (id) => api.delete(`/cart/${id}/`);
export const clearCart = () => api.delete("/cart/clear/");

// Wishlist
export const getWishlist = () => api.get("/wishlist/");
export const addToWishlist = (productId) => api.post("/wishlist/", { product: productId });
export const removeFromWishlist = (productId) => api.delete("/wishlist/", { data: { product: productId } });

// Orders
export const getMyOrders = () => api.get("/orders/");
export const getOrderById = (id) => api.get(`/orders/${id}/`);
export const createOrder = (data) => api.post("/orders/", data);
export const cancelOrder = (id) => api.patch(`/orders/${id}/cancel/`);

// Admin
export const adminGetUsers = (params) => api.get("/admin/users/", { params });
export const adminPatchUser = (id, data) => api.patch(`/admin/users/${id}/`, data);
export const adminDeleteUser = (id) => api.delete(`/admin/users/${id}/`);
export const adminGetOrders = (params) => api.get("/admin/orders/", { params });
export const adminPatchOrder = (id, data) => api.patch(`/admin/orders/${id}/`, data);
export const getUsers = adminGetUsers;
export const getOrders = adminGetOrders;

export default api;
