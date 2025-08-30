
import { useState, useEffect } from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Button from './Button';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';

interface AnimatedAddTaskFormProps {
  onAddTask: (title: string, description: string) => void;
}

export default function AnimatedAddTaskForm({ onAddTask }: AnimatedAddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showError, setShowError] = useState(false);

  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const errorOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  useEffect(() => {
    if (showError) {
      errorOpacity.value = withTiming(1, { duration: 300 });
      const timer = setTimeout(() => {
        errorOpacity.value = withTiming(0, { duration: 300 });
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setShowError(true);
      return;
    }

    // Button press animation
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 200 }, () => {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });

    onAddTask(title, description);
    setTitle('');
    setDescription('');
    // console.log('Task form submitted:', { title, description });
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animatedErrorStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Text style={styles.label}>Add New Task</Text>
      
      <TextInput
        style={[commonStyles.input, showError && !title.trim() && styles.errorInput]}
        placeholder="Task title"
        placeholderTextColor={colors.textSecondary}
        value={title}
        onChangeText={(text) => {
          setTitle(text);
          if (showError && text.trim()) {
            setShowError(false);
          }
        }}
        maxLength={100}
      />
      
      {showError && (
        <Animated.Text style={[styles.errorText, animatedErrorStyle]}>
          Please enter a task title
        </Animated.Text>
      )}
      
      <TextInput
        style={[commonStyles.input, styles.descriptionInput]}
        placeholder="Description (optional)"
        placeholderTextColor={colors.textSecondary}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        maxLength={300}
      />
      
      <Animated.View style={animatedButtonStyle}>
        <Button
          text="Add Task"
          onPress={handleSubmit}
          style={styles.addButton}
        />
      </Animated.View>
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
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    marginTop: 8,
  },
  errorInput: {
    borderColor: colors.danger,
    borderWidth: 2,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: -8,
    marginBottom: 12,
    fontWeight: '500',
  },
});
