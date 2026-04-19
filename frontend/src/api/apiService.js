import axios from "axios";

const resolveApiBaseUrl = () => {
  const raw = import.meta.env.VITE_API_URL?.trim();
  if (!raw) return "/api/";
  const normalized = raw.endsWith("/") ? raw : `${raw}/`;
  return normalized.endsWith("/api/") ? normalized : `${normalized}api/`;
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
});

// ─── Interceptor State ────────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

export const resetInterceptorState = () => {
  isRefreshing = false;
  failedQueue = [];
};

// ─── Routes that must NEVER trigger a refresh attempt ────────────────────────
//
// IMPORTANT: /profile/ is intentionally NOT in this list.
//
// Why: getProfile() is called on every AuthContext mount. If the access token
// has just expired, getProfile() returns 401 — and the interceptor MUST catch
// that 401 and trigger a refresh. If /profile/ were in this list, the interceptor
// would skip the refresh, no new token would be issued, and the user would appear
// logged out even though their refresh token is still perfectly valid.
//
// The only routes here are ones where a 401 means "credentials are genuinely
// wrong" (login/register) or "we are already in a refresh cycle" (token/refresh,
// logout). For all of these, retrying makes no sense.

const AUTH_ROUTES = [
  "/login/",
  "/register/",
  "/token/refresh/",
  "/logout/",
];

const isAuthRoute = (url) => AUTH_ROUTES.some((route) => url?.includes(route));

// ─── Response Interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Pass through: not a 401, or a route we should never retry, or already retried
    if (
      error.response?.status !== 401 ||
      isAuthRoute(original?.url) ||
      original?._retry
    ) {
      return Promise.reject(error);
    }

    // A refresh is already in flight — queue this request and wait
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(original));
      // .then() is OUTSIDE the Promise constructor so it actually returns
      // the retried request's response, not undefined
    }

    // This request becomes the one that triggers the refresh
    original._retry = true;
    isRefreshing = true;

    try {
      await api.post("/token/refresh/");
      processQueue(null);
      return api(original);
    } catch (err) {
      // Refresh token is dead — clear queue and force logout
      processQueue(err);
      window.dispatchEvent(new CustomEvent("auth:logout"));
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const login          = (data)    => api.post("/login/", data);
export const register       = (data)    => api.post("/register/", data);
export const logout         = ()        => api.post("/logout/");
export const googleLogin    = (payload) => api.post("/auth/google/", payload);
export const forgotPassword = (email)   => api.post("/forgot-password/", { email });
export const resetPassword  = (data)    => api.post("/reset-password/", data);

// ─── Profile ──────────────────────────────────────────────────────────────────

export const getProfile    = ()     => api.get("/profile/");
export const updateProfile = (data) => api.patch("/profile/", data);

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts      = (params)      => api.get("/products/", { params });
export const getProductBySlug = (slug)        => api.get(`/products/${slug}/`);
export const createProduct    = (data)        => api.post("/products/", data);
export const updateProduct    = (slug, data)  => api.put(`/products/${slug}/`, data);
export const patchProduct     = (slug, data)  => api.patch(`/products/${slug}/`, data);
export const deleteProduct    = (slug)        => api.delete(`/products/${slug}/`);

// ─── Cart ─────────────────────────────────────────────────────────────────────

export const getCart        = ()         => api.get("/cart/");
export const addToCart      = (data)     => api.post("/cart/", data);
export const updateCartItem = (id, data) => api.patch(`/cart/${id}/`, data);
export const removeCartItem = (id)       => api.delete(`/cart/${id}/`);
export const clearCart      = ()         => api.delete("/cart/clear/");

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export const getWishlist        = ()          => api.get("/wishlist/");
export const addToWishlist      = (productId) => api.post("/wishlist/", { product: productId });
export const removeFromWishlist = (productId) =>
  api.delete("/wishlist/", { data: { product: productId } });

// ─── Orders ───────────────────────────────────────────────────────────────────

export const getMyOrders  = ()      => api.get("/orders/");
export const getOrderById = (id)    => api.get(`/orders/${id}/`);
export const createOrder  = (data)  => api.post("/orders/", data);
export const cancelOrder  = (id)    => api.patch(`/orders/${id}/cancel/`);

// ─── Razorpay ─────────────────────────────────────────────────────────────────

export const createRazorpayOrder   = (data) => api.post("/razorpay/create-order/", data);
export const verifyRazorpayPayment = (data) => api.post("/razorpay/verify/", data);

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminGetUsers   = (params)      => api.get("/admin/users/", { params });
export const adminPatchUser  = (id, data)    => api.patch(`/admin/users/${id}/`, data);
export const adminDeleteUser = (id)          => api.delete(`/admin/users/${id}/`);
export const adminGetOrders  = (params)      => api.get("/admin/orders/", { params });
export const adminPatchOrder = (id, data)    => api.patch(`/admin/orders/${id}/`, data);

export const getUsers  = adminGetUsers;
export const getOrders = adminGetOrders;

export { api as client };
export default api;