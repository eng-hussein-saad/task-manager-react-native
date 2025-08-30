/** Auth API bindings: register and login; persists token on success. */
import { api } from "./api";
import { saveToken } from "./storage";

/** Minimal user shape returned by the backend. */
export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

/** Response for auth endpoints: user plus JWT token. */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Register a new account and persist token if returned.
 */
export async function register(payload: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("auth/register", payload);
  if (data?.token) await saveToken(data.token);
  return data;
}

/**
 * Log in and persist token if returned.
 */
export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("auth/login", payload);
  if (data?.token) await saveToken(data.token);
  return data;
}
