import type { User } from "@/types/user";
import type { BoardDetail } from "@/types/board";

export function getSharedPeopleFromBoards(
  boards: BoardDetail[] | { ownerId: string; owner: User; members: { userId: string; user: User }[] }[],
  currentUserId: string,
): User[] {
  const people = new Map<string, User>();

  for (const board of boards) {
    if (board.ownerId !== currentUserId) {
      people.set(board.owner.id, board.owner);
    }

    for (const member of board.members) {
      if (member.userId !== currentUserId) {
        people.set(member.user.id, member.user);
      }
    }
  }

  return [...people.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

export function getBoardSidebarPeople(
  board: BoardDetail,
  currentUserId: string,
): User[] {
  return getSharedPeopleFromBoards([board], currentUserId);
}
