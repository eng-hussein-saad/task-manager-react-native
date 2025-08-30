
import { useState, useCallback } from 'react';
import { Task, TaskStatus } from '../types/Task';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskStatus>('all');

  const addTask = useCallback((title: string, description: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: new Date(),
    };
    
    setTasks(prevTasks => [newTask, ...prevTasks]);
    console.log('Task added:', newTask);
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined,
            }
          : task
      )
    );
    console.log('Task toggled:', taskId);
  }, []);

  const updateTask = useCallback((taskId: string, title: string, description: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              title: title.trim(),
              description: description.trim(),
            }
          : task
      )
    );
    console.log('Task updated:', { taskId, title, description });
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    // Add a small delay to allow exit animation to complete
    setTimeout(() => {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      console.log('Task deleted:', taskId);
    }, 250);
  }, []);

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'active':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.completed).length,
    active: tasks.filter(task => !task.completed).length,
  };

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    filter,
    setFilter,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    taskStats,
  };
};
