// src/components/utils/request.jsx
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

// --------------------------------------------------
// GLOBAL AXIOS CLIENT
// --------------------------------------------------
export const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Referrer-Policy": "strict-origin-when-cross-origin",
  },
});

// --------------------------------------------------
// MAIN REQUEST WRAPPER
// --------------------------------------------------
export const request = async ({ ...option }) => {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  // attach token
  if (accessToken) {
    client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }

  const onSuccess = (response) => response;

  const onError = async (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.message === "JWT token has expired" &&
      refreshToken
    ) {
      try {
        const res = await axios.get(`${BASE_URL}/auth/refresh-token`, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
            "API-Key": API_KEY,
            "Referrer-Policy": "strict-origin-when-cross-origin",
          },
        });

        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);
        localStorage.setItem("role", res.data.role);

        client.defaults.headers.common.Authorization =
          `Bearer ${res.data.access_token}`;

        return client(option);
      } catch (err) {
        localStorage.clear();
        window.location.href = FRONTEND_URL;
        return err;
      }
    }

    throw error;
  };

  return client(option).then(onSuccess).catch(onError);
};
