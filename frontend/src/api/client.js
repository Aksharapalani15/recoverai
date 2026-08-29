import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export const getHealth = () => api.get("/api/health").then((r) => r.data);
export const getKpis = () => api.get("/api/kpis").then((r) => r.data);
export const getCharts = () => api.get("/api/analytics/charts").then((r) => r.data);
export const getModelMetrics = () => api.get("/api/model/metrics").then((r) => r.data);
export const getFilters = () => api.get("/api/transactions/filters").then((r) => r.data);

export const getTransactions = (params) =>
  api.get("/api/transactions", { params }).then((r) => r.data);

export const getTransaction = (id) =>
  api.get(`/api/transactions/${id}`).then((r) => r.data);

export const getAiInsight = (id, refresh = false) =>
  api
    .post(`/api/transactions/${id}/ai-insight`, null, { params: { refresh } })
    .then((r) => r.data);
