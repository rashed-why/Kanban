import type { User } from "./user";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  columnId: string;
  createdAt: string;
};

export type Column = {
  id: string;
  title: string;
  position: number;
  boardId: string;
  createdAt: string;
  tasks: Task[];
};

export type BoardMember = {
  id: string;
  role: string;
  userId: string;
  user: User;
};

export type BoardListItem = {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  owner: User;
  members: BoardMember[];
};

export type BoardDetail = BoardListItem & {
  columns: Column[];
};

export type CreateBoardPayload = {
  title: string;
};

export type UpdateBoardPayload = {
  title: string;
};

export type CreateColumnPayload = {
  title: string;
};

export type UpdateColumnPayload = {
  title: string;
};

export type CreateTaskPayload = {
  title: string;
  description?: string;
};

export type UpdateTaskPayload = {
  title: string;
  description?: string;
};

export type MoveTaskPayload = {
  fromColumnId: string;
  toColumnId: string;
  newPosition: number;
};

export type ShareBoardPayload = {
  email: string;
  role: "EDITOR" | "VIEWER";
};

export type BoardMemberItem = {
  userId: string;
  name: string;
  email: string;
  role: string;
};
