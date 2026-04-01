import axios from "axios";

// In dev: Vite proxy forwards /api/* → Django (same origin, cookies work)
// In prod: /api/ hits your actual domain (nginx/server handles it)
const api = axios.create({
  baseURL: "/api/",
  withCredentials: true,
});

// ─── Token Refresh Interceptor ────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

const AUTH_ROUTES = ["/login/", "/register/", "/token/refresh/", "/logout/"];
const isAuthRoute = (url) => AUTH_ROUTES.some((route) => url?.includes(route));

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || isAuthRoute(original?.url) || original?._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
        .then(() => api(original));
    }

    original._retry = true;
    isRefreshing = true;

    try {
      await api.post("/token/refresh/");
      processQueue(null);
      return api(original);
    } catch (err) {
      processQueue(err);
      if (window.location.pathname !== "/sign_in") {
        window.location.href = "/sign_in";
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const login    = (data) => api.post("/login/", data);
export const register = (data) => api.post("/register/", data);
export const logout   = ()     => api.post("/logout/");

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getProfile    = ()     => api.get("/profile/");
export const updateProfile = (data) => api.patch("/profile/", data);

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts      = (params) => api.get("/products/", { params });
export const getProductBySlug = (slug)   => api.get(`/products/${slug}/`);
export const createProduct    = (data)   => api.post("/products/", data);
export const updateProduct    = (slug, data) => api.put(`/products/${slug}/`, data);
export const patchProduct     = (slug, data) => api.patch(`/products/${slug}/`, data);
export const deleteProduct    = (slug)   => api.delete(`/products/${slug}/`);

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const getCart        = ()         => api.get("/cart/");
export const addToCart      = (data)     => api.post("/cart/", data);
export const updateCartItem = (id, data) => api.patch(`/cart/${id}/`, data);
export const removeCartItem = (id)       => api.delete(`/cart/${id}/`);
export const clearCart      = ()         => api.delete("/cart/clear/");

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const getWishlist        = ()          => api.get("/wishlist/");
export const addToWishlist      = (productId) => api.post("/wishlist/", { product: productId });
export const removeFromWishlist = (productId) => api.delete("/wishlist/", { data: { product: productId } });

// ─── Orders ───────────────────────────────────────────────────────────────────

export const getMyOrders  = ()         => api.get("/orders/");
export const getOrderById = (id)       => api.get(`/orders/${id}/`);
export const createOrder  = (data)     => api.post("/orders/", data);
export const cancelOrder  = (id)       => api.patch(`/orders/${id}/cancel/`);

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminGetUsers   = (params)   => api.get("/admin/users/", { params });
export const adminPatchUser  = (id, data) => api.patch(`/admin/users/${id}/`, data);
export const adminDeleteUser = (id)       => api.delete(`/admin/users/${id}/`);
export const adminGetOrders  = (params)   => api.get("/admin/orders/", { params });
export const adminPatchOrder = (id, data) => api.patch(`/admin/orders/${id}/`, data);

// Aliases
export const getUsers  = adminGetUsers;
export const getOrders = adminGetOrders;

export { api as client };
export default api;