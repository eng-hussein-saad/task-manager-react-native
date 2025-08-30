/** Task API bindings for server-backed CRUD. */
import { api } from "./api";

/** Canonical server-side task shape. */
export interface RemoteTaskItem {
  task_id: number;
  task_title: string;
  task_description: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  user_id: number;
}

/** Fetch all tasks for current user. */
export async function fetchTasks(): Promise<RemoteTaskItem[]> {
  const { data } = await api.get<RemoteTaskItem[]>("tasks/");
  // console.log("Fetched tasks:", data);
  return data;
}

/** Create a new task. */
export async function createTask(payload: {
  task_title: string;
  task_description: string;
}) {
  const { data } = await api.post<RemoteTaskItem>("tasks/", payload);
  return data;
}

/** Update an existing task by id. */
export async function updateTaskRemote(
  id: string | number,
  payload: { task_title: string; task_description: string }
) {
  const { data } = await api.put<RemoteTaskItem>(`tasks/${id}`, payload);
  return data;
}

/** Delete a task by id. */
export async function deleteTaskRemote(id: string | number) {
  await api.delete(`tasks/${id}`);
}

/** Toggle completion (is_read) state on the server. */
export async function toggleTaskRead(id: string | number) {
  const { data } = await api.patch<RemoteTaskItem>(`tasks/${id}/toggle-read`);
  return data;
}
