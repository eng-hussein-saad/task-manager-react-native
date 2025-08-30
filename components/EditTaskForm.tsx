
import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { colors } from '../styles/commonStyles';
import { Task } from '../types/Task';
import Button from './Button';
import Icon from './Icon';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';

interface EditTaskFormProps {
  visible: boolean;
  task: Task | null;
  onSave: (taskId: string, title: string, description: string) => void;
  onCancel: () => void;
}

export default function EditTaskForm({
  visible,
  task,
  onSave,
  onCancel
}: EditTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showError, setShowError] = useState(false);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const errorOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible && task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setShowError(false);
    }
  }, [visible, task]);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  useEffect(() => {
    if (showError) {
      errorOpacity.value = withTiming(1, { duration: 200 });
      setTimeout(() => {
        errorOpacity.value = withTiming(0, { duration: 200 });
        setShowError(false);
      }, 3000);
    }
  }, [showError]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedErrorStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
  }));

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setShowError(true);
      console.log('Edit task validation failed: empty title');
      return;
    }

    if (task) {
      onSave(task.id, trimmedTitle, trimmedDescription);
      console.log('Task edited:', { id: task.id, title: trimmedTitle, description: trimmedDescription });
    }
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setShowError(false);
    onCancel();
  };

  if (!visible || !task) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <TouchableOpacity 
            style={styles.backdropTouchable} 
            onPress={handleCancel}
            activeOpacity={1}
          />
        </Animated.View>
        
        <Animated.View style={[styles.modal, animatedModalStyle]}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Task</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.errorContainer, animatedErrorStyle]}>
            {showError && (
              <View style={styles.errorMessage}>
                <Icon name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>Task title is required</Text>
              </View>
            )}
          </Animated.View>

          <View style={styles.form}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={[styles.input, showError && !title.trim() && styles.inputError]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title"
              placeholderTextColor={colors.textSecondary}
              maxLength={100}
              autoFocus
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description (optional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              maxLength={500}
              textAlignVertical="top"
            />

            <View style={styles.buttonContainer}>
              <Button
                text="Cancel"
                onPress={handleCancel}
                variant="outline"
                style={styles.button}
              />
              <Button
                text="Save Changes"
                onPress={handleSave}
                variant="primary"
                style={styles.button}
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    flex: 1,
  },
  modal: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 0,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.2)',
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorContainer: {
    paddingHorizontal: 20,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginTop: 0,
  },
});
