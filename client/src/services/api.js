import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tg_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("tg_token");
      localStorage.removeItem("tg_user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
};

// ── Dashboard ─────────────────────────────────────────
export const dashboardAPI = {
  overview: () => api.get("/dashboard/overview"),
  riskDistribution: () => api.get("/dashboard/risk-distribution"),
  recentAlerts: (limit = 5) =>
    api.get(`/dashboard/recent-alerts?limit=${limit}`),
  routePerformance: () => api.get("/dashboard/route-performance"),
  facilityAnomalies: () => api.get("/dashboard/facility-anomalies"),
  riskTrend: (days = 7) => api.get(`/dashboard/risk-trend?days=${days}`),
};

// ── Parcels ───────────────────────────────────────────
export const parcelAPI = {
  list: (params = {}) => api.get("/parcels", { params }),
  getById: (id) => api.get(`/parcels/${id}`),
  getByTracking: (tn) => api.get(`/parcels/tracking/${tn}`),
  getScans: (id) => api.get(`/parcels/${id}/scans`),
  getRisk: (id) => api.get(`/parcels/${id}/risk`),
};

// ── Alerts ────────────────────────────────────────────
export const alertAPI = {
  list: (params = {}) => api.get("/alerts", { params }),
  getById: (id) => api.get(`/alerts/${id}`),
  update: (id, status) => api.patch(`/alerts/${id}`, { status }),
};

// ── Facilities ────────────────────────────────────────
export const facilityAPI = {
  list: () => api.get("/facilities"),
  getById: (id) => api.get(`/facilities/${id}`),
  getParcels: (id) => api.get(`/facilities/${id}/parcels`),
};

// ── Routes ────────────────────────────────────────────
export const routeAPI = {
  list: () => api.get("/routes"),
  getById: (id) => api.get(`/routes/${id}`),
  getSummary: (id) => api.get(`/routes/${id}/summary`),
};

export default api;
