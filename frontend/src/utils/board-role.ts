import type { BoardDetail, BoardListItem } from "@/types/board";

export type BoardRole = "OWNER" | "EDITOR" | "VIEWER";

type BoardWithMembers = Pick<BoardListItem, "ownerId" | "members">;

export function getUserBoardRole(
  board: BoardWithMembers,
  userId: string,
): BoardRole | null {
  if (board.ownerId === userId) {
    return "OWNER";
  }

  const member = board.members.find((entry) => entry.userId === userId);

  if (!member) {
    return null;
  }

  return member.role.toUpperCase() as BoardRole;
}

export function canEditBoard(
  board: BoardWithMembers | BoardDetail,
  userId: string,
): boolean {
  const role = getUserBoardRole(board, userId);

  return role === "OWNER" || role === "EDITOR";
}
