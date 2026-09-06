import type { BoardDetail, BoardListItem, BoardMemberItem } from "@/types/board";
import api from "../api";

export const boardKeys = {
  all: ["boards"] as const,
  detail: (boardId: string) => ["boards", boardId] as const,
  members: (boardId: string) => ["boards", boardId, "members"] as const,
};

export const fetchBoardsAPI = async () => {
  const { data } = await api.get<BoardListItem[]>("/boards");
  return data;
};

export const fetchBoardAPI = async (boardId: string) => {
  const { data } = await api.get<BoardDetail>(`/boards/${boardId}`);
  return data;
};

export const fetchBoardMembersAPI = async (boardId: string) => {
  const { data } = await api.get<BoardMemberItem[]>(
    `/boards/${boardId}/members`,
  );
  return data;
};
