import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Button from "../components/Button";
import Icon from "../components/Icon";
import Toast from "../components/Toast";
import { useTasks } from "../hooks/useTasks";
import { useToast } from "../hooks/useToasts";
import { colors, commonStyles } from "../styles/commonStyles";
import { login as loginApi } from "../utils/authApi";

/** Login screen: animated form, toasts, and secure auth flow. */
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast, hideToast, toast } = useToast();
  const { loadRemoteTasks } = useTasks();

  const btnScale = useSharedValue(1);
  const formOpacity = useSharedValue(0);
  const formScale = useSharedValue(0.95);

  useEffect(() => {
    formOpacity.value = withTiming(1, { duration: 350 });
    formScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, [formOpacity, formScale]);

  const animatedForm = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ scale: formScale.value }],
  }));
  const animatedBtn = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      showToast("Please enter email and password", "error");
      return;
    }
    try {
      setSubmitting(true);
      btnScale.value = withSpring(0.96, {}, () => {
        btnScale.value = withSpring(1);
      });
      await loginApi({ email: email.trim(), password });
      // Optionally pre-load tasks after login
      try {
        await loadRemoteTasks();
      } catch {}
      showToast("Logged in successfully", "success");
      setTimeout(() => router.replace("/" as any), 600);
    } catch (e: any) {
      showToast(e?.response?.data?.message || "Login failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={commonStyles.wrapper}>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
      <View style={[commonStyles.container, commonStyles.center]}>
        <View style={styles.hero}>
          <Text style={styles.appTitle}>Welcome to Tasks Manager</Text>
          <Text style={styles.subtitle}>
            Organize your day and stay productive
          </Text>
        </View>
        <Animated.View style={[styles.card, animatedForm]}>
          <Text style={commonStyles.title}>Login</Text>
          <TextInput
            style={commonStyles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <View style={styles.inputWrap}>
            <TextInput
              style={[commonStyles.input, styles.inputWithToggle]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
              style={styles.eyeToggle}
            >
              <Icon
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
          <Animated.View style={animatedBtn}>
            <Button
              text={submitting ? "Logging in..." : "Login"}
              onPress={onSubmit}
              disabled={submitting}
              style={styles.cta}
            />
          </Animated.View>
          <Text
            onPress={() => router.push("/register" as any)}
            style={styles.link}
          >
            Don’t have an account? Register
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    width: "100%",
  },
  cta: {
    marginTop: 12,
  },
  link: {
    marginTop: 16,
    color: colors.primary,
    textAlign: "center",
  },
  hero: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 18,
    alignItems: "center",
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },
  inputWrap: {
    position: "relative",
  },
  inputWithToggle: {
    paddingRight: 44,
  },
  eyeToggle: {
    position: "absolute",
    right: 12,
    top: 12,
  },
});
