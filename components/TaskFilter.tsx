
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import { TaskStatus } from '../types/Task';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';

interface TaskFilterProps {
  currentFilter: TaskStatus;
  onFilterChange: (filter: TaskStatus) => void;
  taskStats: {
    total: number;
    active: number;
    completed: number;
  };
}

export default function TaskFilter({ currentFilter, onFilterChange, taskStats }: TaskFilterProps) {
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const filters: { key: TaskStatus; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: taskStats.total },
    { key: 'active', label: 'Active', count: taskStats.active },
    { key: 'completed', label: 'Completed', count: taskStats.completed },
  ];

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            currentFilter === filter.key && styles.activeFilterButton,
          ]}
          onPress={() => onFilterChange(filter.key)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterText,
              currentFilter === filter.key && styles.activeFilterText,
            ]}
          >
            {filter.label}
          </Text>
          <Text
            style={[
              styles.filterCount,
              currentFilter === filter.key && styles.activeFilterCount,
            ]}
          >
            {filter.count}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    boxShadow: '0px 2px 4px rgba(0, 122, 255, 0.3)',
    elevation: 3,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginRight: 6,
  },
  activeFilterText: {
    color: colors.background,
    fontWeight: '600',
  },
  filterCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    textAlign: 'center',
  },
  activeFilterCount: {
    color: colors.primary,
    backgroundColor: colors.background,
  },
});
