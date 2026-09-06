import { BoardRole } from '../generated/prisma/client';

const BOARD_ROLE_RANK: Record<BoardRole, number> = {
  [BoardRole.VIEWER]: 1,
  [BoardRole.EDITOR]: 2,
  [BoardRole.OWNER]: 3,
};

export function hasMinimumBoardRole(
  userRole: BoardRole,
  requiredRole: BoardRole,
): boolean {
  return BOARD_ROLE_RANK[userRole] >= BOARD_ROLE_RANK[requiredRole];
}
