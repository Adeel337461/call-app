import axios from 'axios';

import { baseURL } from '../common/SummaryApi';

const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// sending access token in the header
Axios.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem("accesstoken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

Axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("accesstoken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default Axios;
