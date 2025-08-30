import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import AnimatedAddTaskForm from "../components/AnimatedAddTaskForm";
import AnimatedTaskItem from "../components/AnimatedTaskItem";
import ConfirmationDialog from "../components/ConfirmationDialog";
import EditTaskForm from "../components/EditTaskForm";
import EmptyState from "../components/EmptyState";
import TaskFilter from "../components/TaskFilter";
import TaskStats from "../components/TaskStats";
import Toast from "../components/Toast";
import { useTasks } from "../hooks/useTasks";
import { useToast } from "../hooks/useToasts";
import { colors, commonStyles } from "../styles/commonStyles";
import { Task } from "../types/Task";

export default function TaskManagerApp() {
  const {
    tasks,
    allTasks,
    filter,
    setFilter,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    taskStats,
  } = useTasks();

  const { toast, showToast, hideToast } = useToast();

  // State for confirmation dialog
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  // Track which task should animate out after confirmation
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // State for edit form
  const [showEditForm, setShowEditForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const handleAddTask = (title: string, description: string) => {
    addTask(title, description);
    showToast("Task added successfully!", "success");
  };

  const handleToggleTask = (taskId: string) => {
    const task = allTasks.find((t: Task) => t.id === taskId);
    toggleTask(taskId);

    if (task) {
      if (task.completed) {
        showToast("Task marked as incomplete", "info");
      } else {
        showToast("Task completed! 🎉", "success");
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = allTasks.find((t: Task) => t.id === taskId);
    if (task) {
      setTaskToDelete(taskId);
      setShowDeleteConfirmation(true);
    }
  };

  const confirmDeleteTask = () => {
    // Do not delete immediately; trigger exit animation
    if (taskToDelete) {
      setDeletingTaskId(taskToDelete);
    }
    setShowDeleteConfirmation(false);
  };

  const handleItemDeleteAnimationEnd = (taskId: string) => {
    // Now actually remove the task and notify
    deleteTask(taskId);
    showToast("Task deleted", "error");
    if (deletingTaskId === taskId) setDeletingTaskId(null);
    if (taskToDelete === taskId) setTaskToDelete(null);
  };

  const cancelDeleteTask = () => {
    setTaskToDelete(null);
    setShowDeleteConfirmation(false);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setShowEditForm(true);
  };

  const handleSaveEditTask = (
    taskId: string,
    title: string,
    description: string
  ) => {
    updateTask(taskId, title, description);
    showToast("Task updated successfully!", "success");
    setShowEditForm(false);
    setTaskToEdit(null);
  };

  const handleCancelEditTask = () => {
    setShowEditForm(false);
    setTaskToEdit(null);
  };

  const getTaskToDeleteName = () => {
    if (taskToDelete) {
      const task = allTasks.find((t: Task) => t.id === taskToDelete);
      return task?.title || "this task";
    }
    return "this task";
  };

  console.log("Current tasks:", tasks.length);
  console.log("Current filter:", filter);
  console.log("Task stats:", taskStats);

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <StatusBar style="dark" backgroundColor={colors.background} />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      <ConfirmationDialog
        visible={showDeleteConfirmation}
        title="Delete Task"
        message={`Are you sure you want to delete "${getTaskToDeleteName()}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteTask}
        onCancel={cancelDeleteTask}
        type="danger"
      />

      <EditTaskForm
        visible={showEditForm}
        task={taskToEdit}
        onSave={handleSaveEditTask}
        onCancel={handleCancelEditTask}
      />

      <View style={commonStyles.container}>
        <ScrollView
          style={commonStyles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={commonStyles.section}>
            <Text style={commonStyles.title}>Task Manager</Text>

            {taskStats.total > 0 && <TaskStats taskStats={taskStats} />}

            <AnimatedAddTaskForm onAddTask={handleAddTask} />

            {taskStats.total > 0 && (
              <TaskFilter
                currentFilter={filter}
                onFilterChange={setFilter}
                taskStats={taskStats}
              />
            )}

            {tasks.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              <View>
                {tasks.map((task: Task, index: number) => (
                  <AnimatedTaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                    index={index}
                    isDeleting={deletingTaskId === task.id}
                    onDeleteAnimationEnd={handleItemDeleteAnimationEnd}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
