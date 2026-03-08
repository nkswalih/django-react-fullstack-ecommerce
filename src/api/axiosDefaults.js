import axios from "axios";

axios.interceptors.request.use((config) => {
  if (config.url?.includes("http://localhost:3000")) {
    config.url = config.url.replace(
      "http://localhost:3000",
      import.meta.env.VITE_API_URL || "http://localhost:3000"
    );
  }
  return config;
});