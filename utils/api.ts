/**
 * API client
 * Centralized Axios instance configured with the app's backend base URL and
 * an interceptor that attaches the bearer token from SecureStore when present.
 */
import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

/**
 * Resolve Backend_Url from Expo config extras or process.env. Expo injects
 * extras at build/runtime; for web/dev we also look at process.env.
 */
const envUrl =
  (Constants?.expoConfig?.extra as any)?.Backend_Url ||
  (Constants?.manifest as any)?.extra?.Backend_Url ||
  (process.env as any)?.Backend_Url;

export const api = axios.create({
  baseURL: typeof envUrl === "string" ? envUrl : undefined,
  headers: { "Content-Type": "application/json" },
});

/**
 * Request interceptor adds Authorization header when a token exists.
 * Note: SecureStore access is async, so we await before continuing.
 */
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("auth_token");
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore
  }
  return config;
});

export default api;
