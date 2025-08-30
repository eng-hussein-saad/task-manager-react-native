import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../styles/commonStyles";
import { Task } from "../types/Task";
import Icon from "./Icon";

interface AnimatedTaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  index: number;
  isDeleting?: boolean;
  onDeleteAnimationEnd?: (taskId: string) => void;
}

export default function AnimatedTaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
  index,
  isDeleting,
  onDeleteAnimationEnd,
}: AnimatedTaskItemProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(50);
  const checkboxScale = useSharedValue(task.completed ? 1 : 0.8);
  const deleteScale = useSharedValue(1);
  const editScale = useSharedValue(1);

  useEffect(() => {
    // Staggered entrance animation
    const delay = index * 100;

    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 400 });
      translateX.value = withSpring(0, { damping: 20, stiffness: 100 });
    }, delay);
  }, [index, opacity, scale, translateX]);

  useEffect(() => {
    // Animate checkbox when task completion changes
    checkboxScale.value = withSpring(
      task.completed ? 1.1 : 0.8,
      {
        damping: 15,
        stiffness: 200,
      },
      () => {
        checkboxScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      }
    );
  }, [task.completed, checkboxScale]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleToggle = () => {
    checkboxScale.value = withSpring(
      1.2,
      { damping: 15, stiffness: 200 },
      () => {
        checkboxScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      }
    );
    onToggle(task.id);
  };

  const handleDelete = () => {
    deleteScale.value = withSpring(1.2, { damping: 15, stiffness: 200 }, () => {
      deleteScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });
    // Request deletion (e.g., open confirmation). Do NOT animate out yet.
    runOnJS(onDelete)(task.id);
  };

  // When parent confirms deletion for this item, animate out then notify parent to actually delete
  useEffect(() => {
    if (isDeleting) {
      scale.value = withTiming(0.8, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 }, () => {
        if (onDeleteAnimationEnd) {
          runOnJS(onDeleteAnimationEnd)(task.id);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeleting]);

  const handleEdit = () => {
    editScale.value = withSpring(1.2, { damping: 15, stiffness: 200 }, () => {
      editScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });
    onEdit(task);
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const animatedCheckboxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkboxScale.value }],
  }));

  const animatedDeleteStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deleteScale.value }],
  }));

  const animatedEditStyle = useAnimatedStyle(() => ({
    transform: [{ scale: editScale.value }],
  }));

  const completionAnimatedStyle = useAnimatedStyle(() => {
    const progress = task.completed ? 1 : 0;
    return {
      opacity: interpolate(progress, [0, 1], [1, 0.7]),
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        task.completed && styles.completedContainer,
        animatedContainerStyle,
        completionAnimatedStyle,
      ]}
    >
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <Animated.View
          style={[
            styles.checkbox,
            task.completed && styles.checkedCheckbox,
            animatedCheckboxStyle,
          ]}
        >
          {task.completed && (
            <Icon name="checkmark" size={16} color={colors.background} />
          )}
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, task.completed && styles.completedTitle]}>
          {task.title}
        </Text>
        {task.description ? (
          <Text
            style={[
              styles.description,
              task.completed && styles.completedDescription,
            ]}
          >
            {task.description}
          </Text>
        ) : null}
        <Text style={styles.date}>
          {task.completed && task.completedAt
            ? `Completed ${formatDate(task.completedAt)}`
            : `Created ${formatDate(task.createdAt)}`}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <Animated.View style={animatedEditStyle}>
            <Icon name="create-outline" size={20} color={colors.primary} />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Animated.View style={animatedDeleteStyle}>
            <Icon name="trash-outline" size={20} color={colors.danger} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
    elevation: 2,
  },
  completedContainer: {
    backgroundColor: colors.backgroundAlt,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.grey,
    alignItems: "center",
    justifyContent: "center",
  },
  checkedCheckbox: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  completedDescription: {
    textDecorationLine: "line-through",
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
    marginLeft: 4,
  },
});
