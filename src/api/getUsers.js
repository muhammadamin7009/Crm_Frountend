import api from "./axios";

export const getUsers = (params) => api.get("/users", { params });

export const createUserByAdmin = (data) => api.post("/users/admin", data);

export const createUserByStaff = (data) => api.post("/users/stuff", data);

export const updateUser = (id, data) => api.patch(`/users/${id}`, data);

export const deleteUser = (id) => api.delete(`/users/${id}`);

export const updateUserImage = (file) => {
  const formData = new FormData();
  formData.append("user_image", file);

  return api.patch("/me/image", formData);
};

export const getUser = (id) => {
  return api.get(`/users/${id}`);
};