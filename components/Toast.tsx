import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';


interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
  onHide: () => void;
}

export default function Toast({ message, type, visible, onHide }: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
      
      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(onHide)();
        });
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return styles.successToast;
      case 'error':
        return styles.errorToast;
      default:
        return styles.infoToast;
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle' as const;
      case 'error':
        return 'close-circle' as const;
      default:
        return 'information-circle' as const;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, getToastStyle(), animatedStyle]}>
      <Icon name={getIconName()} size={20} color={colors.background} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    zIndex: 1000,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 8,
  },
  successToast: {
    backgroundColor: colors.success,
  },
  errorToast: {
    backgroundColor: colors.danger,
  },
  infoToast: {
    backgroundColor: colors.primary,
  },
  message: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});
