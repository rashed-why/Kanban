import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { hasMinimumBoardRole } from './board-permissions';

@Injectable()
export class BoardAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getBoardRole(
    boardId: string,
    userId: string,
  ): Promise<BoardRole | null> {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: {
        ownerId: true,
        members: {
          where: { userId },
          select: { role: true },
          take: 1,
        },
      },
    });

    if (!board) {
      return null;
    }

    if (board.ownerId === userId) {
      return BoardRole.OWNER;
    }

    return board.members[0]?.role ?? null;
  }

  async requireBoardRole(
    boardId: string,
    userId: string,
    minimumRole: BoardRole,
  ): Promise<BoardRole> {
    const role = await this.getBoardRole(boardId, userId);

    if (!role || !hasMinimumBoardRole(role, minimumRole)) {
      throw new NotFoundException('Board not found');
    }

    return role;
  }
}
