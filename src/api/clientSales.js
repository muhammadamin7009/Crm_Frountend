import api from "./axios";

export const getClientSales = (params) =>
  api.get("/client-sales", { params });

export const getClientSalesSummary = (params) =>
  api.get("/client-sales/summary", { params });

export const getClientBalance = (params) =>
  api.get("/client-sales/balance", { params });

export const getClientSale = (id) => api.get(`/client-sales/${id}`);

export const createClientSale = (data) => api.post("/client-sales", data);

export const updateClientSale = (id, data) =>
  api.patch(`/client-sales/${id}`, data);

export const deleteClientSale = (id) => api.delete(`/client-sales/${id}`);
