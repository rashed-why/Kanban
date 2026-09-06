import type { BoardDetail, CreateBoardPayload, ShareBoardPayload, UpdateBoardPayload } from "@/types/board";
import api from "../api";

export const createBoardAPI = async (payload: CreateBoardPayload) => {
  const { data } = await api.post<BoardDetail>("/boards", payload);
  return data;
};

export const updateBoardAPI = async (
  boardId: string,
  payload: UpdateBoardPayload,
) => {
  const { data } = await api.patch<BoardDetail>(`/boards/${boardId}`, payload);
  return data;
};

export const shareBoardAPI = async (
  boardId: string,
  payload: ShareBoardPayload,
) => {
  const { data } = await api.post<{ success: boolean; message: string }>(
    `/boards/${boardId}/share`,
    payload,
  );
  return data;
};

export const removeBoardMemberAPI = async (
  boardId: string,
  userId: string,
) => {
  const { data } = await api.delete<{ success: boolean; message: string }>(
    `/boards/${boardId}/members/${userId}`,
  );
  return data;
};

export const deleteBoardAPI = async (boardId: string) => {
  const { data } = await api.delete<{ message: string }>(`/boards/${boardId}`);
  return data;
};
