import axios from "axios";

// const API = "http://localhost:4000/api/auth";
const API = "https://cms-backend-repo.onrender.com/api/auth";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

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
  const res = await axios.post(`${API}/create-user`, data, getAuthHeader());

  return res.data;
};

/* =========================
   GET ALL USERS
========================= */
export const getUsers = async () => {
  const res = await axios.get(`${API}/users`, getAuthHeader());
  return res.data;
};

/* =========================
   DELETE USER
========================= */
export const deleteUser = async (id: number) => {
  const res = await axios.delete(`${API}/users/${id}`, getAuthHeader());
  return res.data;
};
