import type { CreateTaskPayload, MoveTaskPayload, Task, UpdateTaskPayload } from "@/types/board";
import api from "../api";

export const createTaskAPI = async (
  columnId: string,
  payload: CreateTaskPayload,
) => {
  const { data } = await api.post<Task>(`/columns/${columnId}/tasks`, payload);
  return data;
};

export const updateTaskAPI = async (
  taskId: string,
  payload: UpdateTaskPayload,
) => {
  const { data } = await api.patch<Task>(`/tasks/${taskId}`, payload);
  return data;
};

export const moveTaskAPI = async (
  taskId: string,
  payload: MoveTaskPayload,
) => {
  const { data } = await api.patch<Task>(`/tasks/${taskId}/move`, payload);
  return data;
};

export const deleteTaskAPI = async (taskId: string) => {
  const { data } = await api.delete<{ message: string }>(`/tasks/${taskId}`);
  return data;
};
