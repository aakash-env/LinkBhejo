import axios from "axios";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Attach auth token from NextAuth session on every request
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session) {
    // NextAuth returns the JWT token — attach as Bearer
    config.headers.Authorization = `Bearer ${(session as any).accessToken ?? ""}`;
  }
  return config;
});

// ─────────────────────────────────────────
// Typed API methods
// ─────────────────────────────────────────

export const automationsApi = {
  list: () => api.get("/automations").then((r) => r.data.data),
  get: (id: string) => api.get(`/automations/${id}`).then((r) => r.data.data),
  create: (data: any) => api.post("/automations", data).then((r) => r.data.data),
  update: (id: string, data: any) =>
    api.patch(`/automations/${id}`, data).then((r) => r.data.data),
  delete: (id: string) => api.delete(`/automations/${id}`),
  toggle: (id: string) => api.post(`/automations/${id}/toggle`).then((r) => r.data.data),
  retrigger: (id: string, postId: string) =>
    api.post(`/automations/${id}/retrigger`, { postId }),
};

export const accountsApi = {
  list: () => api.get("/accounts").then((r) => r.data.data),
  stats: (id: string) => api.get(`/accounts/${id}/stats`).then((r) => r.data.data),
  disconnect: (id: string) => api.delete(`/accounts/${id}`),
};

export const leadsApi = {
  list: (params?: any) => api.get("/leads", { params }).then((r) => r.data),
  exportCsv: (params?: any) =>
    api.get("/leads/export", { params, responseType: "blob" }).then((r) => r.data),
  delete: (id: string) => api.delete(`/leads/${id}`),
};

export const analyticsApi = {
  overview: (params?: { accountId?: string; days?: number }) =>
    api.get("/analytics/overview", { params }).then((r) => r.data.data),
  timeline: (params?: { accountId?: string; days?: number }) =>
    api.get("/analytics/timeline", { params }).then((r) => r.data.data),
  automations: (params?: { accountId?: string }) =>
    api.get("/analytics/automations", { params }).then((r) => r.data.data),
};

export const billingApi = {
  usage: () => api.get("/billing/usage").then((r) => r.data.data),
  createCheckout: (data: { plan: string; successUrl: string; cancelUrl: string }) =>
    api.post("/billing/create-checkout", data).then((r) => r.data.data),
  portal: (returnUrl: string) =>
    api.post("/billing/portal", { returnUrl }).then((r) => r.data.data),
};
