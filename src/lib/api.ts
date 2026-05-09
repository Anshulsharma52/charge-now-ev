import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem("pp_user");
    if (userString) {
      const user = JSON.parse(userString);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("pp_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
