import api from "./api";

/* =========================
   CREATE USER
========================= */
export const createUser = async (data: {
  fullName: string;
  email: string;
  password: string;
  role: string;
  state?: string | null;
  states?: string[];
}) => {
  const res = await api.post("/auth/create-user", data);

  return res.data;
};

/* =========================
   GET ALL USERS
========================= */
export const getUsers = async () => {
  const res = await api.get("/auth/users");
  return res.data;
};

/* =========================
   GET USER BY ID
========================= */
export const getUserById = async (id: number) => {
  const res = await api.get(`/auth/users/${id}`);
  return res.data;
};

/* =========================
   DELETE USER
========================= */
export const deleteUser = async (id: number) => {
  const res = await api.delete(`/auth/users/${id}`);
  return res.data;
};

/* =========================
   UPDATE PASSWORD
========================= */
export const updatePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const res = await api.post("/auth/update-password", data);
  return res.data;
};
