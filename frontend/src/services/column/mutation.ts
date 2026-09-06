import type { Column, CreateColumnPayload, UpdateColumnPayload } from "@/types/board";
import api from "../api";

export const createColumnAPI = async (
  boardId: string,
  payload: CreateColumnPayload,
) => {
  const { data } = await api.post<Column>(
    `/boards/${boardId}/columns`,
    payload,
  );
  return data;
};

export const updateColumnAPI = async (
  columnId: string,
  payload: UpdateColumnPayload,
) => {
  const { data } = await api.patch<Column>(`/columns/${columnId}`, payload);
  return data;
};

export const deleteColumnAPI = async (columnId: string) => {
  const { data } = await api.delete<{ message: string }>(`/columns/${columnId}`);
  return data;
};
