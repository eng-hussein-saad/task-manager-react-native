
import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate
} from 'react-native-reanimated';

interface TaskStatsProps {
  taskStats: {
    total: number;
    active: number;
    completed: number;
  };
}

export default function TaskStats({ taskStats }: TaskStatsProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 500 });
    
    // Progress bar animation
    const completionPercentage = taskStats.total > 0 ? (taskStats.completed / taskStats.total) : 0;
    progressWidth.value = withTiming(completionPercentage, { duration: 800 });
  }, [taskStats]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressWidth.value, [0, 1], [0, 100])}%`,
  }));

  const completionPercentage = taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0;

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.percentage}>{completionPercentage}%</Text>
      </View>
      
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{taskStats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{taskStats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{taskStats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  percentage: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.success,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
