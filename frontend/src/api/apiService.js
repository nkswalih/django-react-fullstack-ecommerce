import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";
const BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl : `${rawBaseUrl}/`;

const api = axios.create({
  baseURL: BASE_URL,
});

const AUTH_STORAGE_KEYS = ["access_token", "refresh_token", "currentUser", "user", "isAuthenticated"];

const setStoredUser = (user) => {
  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("isAuthenticated", "true");
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

export const clearAuth = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const saveAuth = (tokens, user) => {
  localStorage.setItem("access_token", tokens.access);
  localStorage.setItem("refresh_token", tokens.refresh);
  setStoredUser(user);
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshTokenValue = localStorage.getItem("refresh_token");

    if (
      error.response?.status === 401 &&
      refreshTokenValue &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/login/") &&
      !originalRequest?.url?.includes("/register/") &&
      !originalRequest?.url?.includes("/token/refresh/")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${BASE_URL}token/refresh/`, {
          refresh: refreshTokenValue,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem("access_token", newAccessToken);

        if (res.data.refresh) {
          localStorage.setItem("refresh_token", res.data.refresh);
        }

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        window.location.href = "/sign_in";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

const productPath = (slugOrProduct) => {
  if (typeof slugOrProduct === "string") {
    return slugOrProduct;
  }
  if (typeof slugOrProduct === "object" && slugOrProduct?.slug) {
    return slugOrProduct.slug;
  }
  return String(slugOrProduct);
};

export const client = api;

// --user
export const login = (data) => api.post("/login/", data);
export const register = (data) => api.post("/register/", data);
export const refreshToken = (refresh) => api.post("/token/refresh/", { refresh });

export const getProfile = () => api.get("/profile/");
export const updateProfile = (data) => api.patch("/profile/", data);

// products
export const getProducts = (params) => api.get("/products/", { params });
export const getProductBySlug = (slug) => api.get(`/products/${slug}/`);
export const createProduct = (data) => api.post("/products/", data);
export const updateProduct = (slug, data) => api.put(`/products/${productPath(slug)}/`, data);
export const patchProduct = (slug, data) => api.patch(`/products/${productPath(slug)}/`, data);
export const deleteProduct = (slug) => api.delete(`/products/${productPath(slug)}/`);

//  cart
export const getCart = () => api.get("/cart/");
export const addToCart = (data) => api.post("/cart/", data);
export const updateCartItem = (id, data) => api.patch(`/cart/${id}/`, data);
export const removeCartItem = (id) => api.delete(`/cart/${id}/`);
export const clearCart = () => api.delete("/cart/clear/");

// wishlist
export const getWishlist = () => api.get('/wishlist/');
export const addToWishlist = (productId) => api.post('/wishlist/', { product: productId });
export const removeFromWishlist = (productId) => api.delete('/wishlist/', { data: { product: productId } });

// orders
export const getOrders = () => api.get("/admin/orders/");
export const getMyOrders = () => api.get("/orders/");
export const getOrderById = (id) => api.get(`/orders/${id}/`);
export const createOrder = (data) => api.post("/orders/", data);
export const cancelOrder = (id) => api.patch(`/orders/${id}/cancel/`);
export const patchOrder = (id, data) => api.patch(`/admin/orders/${id}/`, data);

export const getUsers = () => api.get("/admin/users/");
export const getUserById = () => getProfile();
export const patchUser = (id, data) => api.patch(`/admin/users/${id}/`, data);

export const adminGetUsers = getUsers;
export const adminPatchUser = patchUser;
export const adminDeleteUser = (id) => api.delete(`/admin/users/${id}/`);
export const adminGetOrders = getOrders;
export const adminPatchOrder = patchOrder;

export default api;
