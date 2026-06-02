import axios from "axios";

// Creating a global axios instance pointing to our Node/Express backend
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export default API;