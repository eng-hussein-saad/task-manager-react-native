/** Root layout: installs error logging, manages auth guard, and safe area. */
import { router, Stack, useGlobalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform, SafeAreaView } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { commonStyles } from "../styles/commonStyles";
import { api } from "../utils/api";
import { setupErrorLogging } from "../utils/errorLogger";
import { deleteToken, getToken, saveToken } from "../utils/storage";
import { fetchTasks } from "../utils/tasksApi";

const STORAGE_KEY = "emulated_device";

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const { emulate } = useGlobalSearchParams<{ emulate?: string }>();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);

  useEffect(() => {
    // Set up global error logging
    setupErrorLogging();

    if (Platform.OS === "web") {
      // If there's a new emulate parameter, store it
      if (emulate) {
        localStorage.setItem(STORAGE_KEY, emulate);
        setStoredEmulate(emulate);
      } else {
        // If no emulate parameter, try to get from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setStoredEmulate(stored);
        }
      }
    }
  }, [emulate]);

  // Auth guard: check token on app start and route accordingly
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const token = await getToken();
        if (!token) {
          if (!cancelled) router.replace("/login" as any);
          return;
        }
        // Verify token by probing an authenticated endpoint
        try {
          // Probe and also warm cache by fetching tasks
          await fetchTasks();
          if (!cancelled) router.replace("/" as any);
          return;
        } catch (err: any) {
          const status = err?.response?.status;
          if (status === 401 || status === 403) {
            // Try to refresh
            try {
              const { data } = await api.post<{ token: string }>(
                "auth/refresh"
              );
              if (data?.token) await saveToken(data.token);
              if (!cancelled) router.replace("/" as any);
              return;
            } catch {
              await deleteToken();
              if (!cancelled) router.replace("/login" as any);
              return;
            }
          }
          // For other errors, proceed to tasks and let UI handle
          if (!cancelled) router.replace("/" as any);
        }
      } catch {
        if (!cancelled) router.replace("/login" as any);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  let insetsToUse = actualInsets;

  if (Platform.OS === "web") {
    const simulatedInsets = {
      ios: { top: 47, bottom: 20, left: 0, right: 0 },
      android: { top: 40, bottom: 0, left: 0, right: 0 },
    };

    // Use stored emulate value if available, otherwise use the current emulate parameter
    const deviceToEmulate = storedEmulate || emulate;
    insetsToUse = deviceToEmulate
      ? simulatedInsets[deviceToEmulate as keyof typeof simulatedInsets] ||
        actualInsets
      : actualInsets;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          commonStyles.wrapper,
          {
            paddingTop: insetsToUse.top,
            paddingBottom: insetsToUse.bottom,
            paddingLeft: insetsToUse.left,
            paddingRight: insetsToUse.right,
          },
        ]}
      >
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "default",
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
