
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';

interface EmptyStateProps {
  filter: 'all' | 'active' | 'completed';
}

export default function EmptyState({ filter }: EmptyStateProps) {
  const getEmptyStateContent = () => {
    switch (filter) {
      case 'active':
        return {
          icon: 'checkmark-circle-outline' as const,
          title: 'All tasks completed!',
          subtitle: 'Great job! You&apos;ve finished all your tasks.',
        };
      case 'completed':
        return {
          icon: 'time-outline' as const,
          title: 'No completed tasks yet',
          subtitle: 'Complete some tasks to see them here.',
        };
      default:
        return {
          icon: 'add-circle-outline' as const,
          title: 'No tasks yet',
          subtitle: 'Add your first task to get started!',
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <View style={styles.container}>
      <Icon name={content.icon} size={64} color={colors.textSecondary} />
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
