import axios from "axios";

// Auto-retry on 503 (Render free-tier cold start)
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (
      error.response?.status === 503 &&
      config &&
      !config.__retryCount
    ) {
      config.__retryCount = 0;
    }
    if (
      error.response?.status === 503 &&
      config &&
      config.__retryCount < 3
    ) {
      config.__retryCount += 1;
      // Wait before retrying (increasing delay: 2s, 4s, 6s)
      await new Promise((r) => setTimeout(r, config.__retryCount * 2000));
      return axios(config);
    }
    return Promise.reject(error);
  }
);

export default axios;
