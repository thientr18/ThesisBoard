import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

export const getUsers = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createUser = async (name: string) => {
  const res = await axios.post(API_URL, { name });
  return res.data;
};
