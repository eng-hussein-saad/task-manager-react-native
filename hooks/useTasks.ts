/**
 * useTasks
 * Local state and actions for tasks with optimistic updates backed by server APIs.
 * Exposes filtered tasks, stats, and CRUD helpers including remote loading.
 */
import { useCallback, useState } from "react";
import { Task, TaskStatus } from "../types/Task";
import {
  createTask,
  deleteTaskRemote,
  fetchTasks,
  toggleTaskRead,
  updateTaskRemote,
} from "../utils/tasksApi";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskStatus>("all");

  /** Create a task (optimistic) then reconcile with server id. */
  const addTask = useCallback(async (title: string, description: string) => {
    // Optimistic local add
    const tempId = Date.now().toString();
    const optimistic: Task = {
      id: tempId,
      title: title.trim(),
      description: description.trim(),
      completed: false,
      createdAt: new Date(),
    };
    setTasks((prev) => [optimistic, ...prev]);
    // console.log("Task added:", optimistic);
    try {
      const created = await createTask({
        task_title: optimistic.title,
        task_description: optimistic.description,
      });
      // Replace temp with server version (keep order stable)
      setTasks((prev) =>
        prev.map((t) =>
          t.id === tempId
            ? {
                id: String(created.task_id),
                title: created.task_title,
                description: created.task_description ?? "",
                completed: !!created.is_read,
                createdAt: new Date(created.created_at),
                completedAt: undefined,
              }
            : t
        )
      );
    } catch (e) {
      // Rollback optimistic
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      // console.log("Failed to create task");
      throw e;
    }
  }, []);

  /** Toggle completion (optimistic) with server PATCH; rollback on failure. */
  const toggleTask = useCallback(async (taskId: string) => {
    // Optimistic toggle
    let previous: Task | undefined;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          previous = { ...t };
          return {
            ...t,
            completed: !t.completed,
            completedAt: !t.completed ? new Date() : undefined,
          };
        }
        return t;
      })
    );
    // console.log("Task toggled:", taskId);
    try {
      await toggleTaskRead(taskId);
    } catch (e) {
      // rollback on failure
      if (previous) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? previous! : t)));
      }
      throw e;
    }
  }, []);

  /** Update title/description (optimistic), persist via PUT. */
  const updateTask = useCallback(
    async (taskId: string, title: string, description: string) => {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, title: title.trim(), description: description.trim() }
            : t
        )
      );
      // console.log("Task updated:", { taskId, title, description });
      try {
        await updateTaskRemote(taskId, {
          task_title: title.trim(),
          task_description: description.trim(),
        });
      } catch (e) {
        // Optionally refetch or show error; for now noop
        throw e;
      }
    },
    []
  );

  /** Delete task remotely and prune locally. */
  const deleteTask = useCallback(async (taskId: string) => {
    // Allow exit animation separately; here do remote delete then prune
    try {
      await deleteTaskRemote(taskId);
    } finally {
      // Remove locally regardless (if remote fails, the UI still removes; could rollback if desired)
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      // console.log("Task deleted:", taskId);
    }
  }, []);

  const filteredTasks = tasks.filter((task) => {
    switch (filter) {
      case "active":
        return !task.completed;
      case "completed":
        return task.completed;
      default:
        return true;
    }
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter((task) => task.completed).length,
    active: tasks.filter((task) => !task.completed).length,
  };

  /** Replace local list with remote tasks for the current user. */
  const loadRemoteTasks = useCallback(async () => {
    try {
      const remote = await fetchTasks();
      const mapped: Task[] = remote.map((r) => ({
        id: String(r.task_id),
        title: r.task_title,
        description: r.task_description ?? "",
        completed: !!r.is_read,
        createdAt: new Date(r.created_at),
        completedAt: undefined,
      }));
      setTasks(mapped);
      // console.log("Fetched tasks:", remote);
    } catch {
      // Keep local tasks if fetch fails
    }
  }, []);

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
    loadRemoteTasks,
  };
};
