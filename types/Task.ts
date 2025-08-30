export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export type TaskStatus = 'all' | 'active' | 'completed';
