/**
 * Storage helpers
 * Thin wrapper around expo-secure-store for auth token persistence.
 */
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "auth_token";

/** Save JWT to secure storage. */
export async function saveToken(token: string) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // noop
  }
}

/** Get JWT from secure storage. */
export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Delete JWT from secure storage. */
export async function deleteToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // noop
  }
}
