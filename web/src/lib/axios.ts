import axios from "axios";

export const api = axios.create({
  baseURL: "https://filipe-bacof-nlw-setup-back-end.vercel.app",
  // baseURL: "http://localhost:3333",
});
