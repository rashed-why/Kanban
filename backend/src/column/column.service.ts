import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BoardRole, Prisma } from '../generated/prisma/client';
import { BoardAccessService } from '../board/board-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

const columnInclude = {
  tasks: {
    orderBy: { position: 'asc' as const },
  },
} as const;

@Injectable()
export class ColumnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardAccess: BoardAccessService,
  ) {}

  create(boardId: string, createColumnDto: CreateColumnDto) {
    return this.prisma.$transaction(async (tx) => {
      const columnCount = await tx.column.count({ where: { boardId } });
      const position = createColumnDto.position ?? columnCount;

      if (position < 0 || position > columnCount) {
        throw new BadRequestException('Invalid position');
      }

      if (createColumnDto.position !== undefined) {
        await tx.column.updateMany({
          where: {
            boardId,
            position: { gte: position },
          },
          data: { position: { increment: 1 } },
        });
      }

      return tx.column.create({
        data: {
          title: createColumnDto.title,
          boardId,
          position,
        },
        include: columnInclude,
      });
    });
  }

  async update(id: string, userId: string, updateColumnDto: UpdateColumnDto) {
    const column = await this.getColumnOrThrow(id);

    await this.boardAccess.requireBoardRole(
      column.boardId,
      userId,
      BoardRole.EDITOR,
    );

    if (updateColumnDto.position === undefined) {
      return this.prisma.column.update({
        where: { id },
        data: {
          ...(updateColumnDto.title !== undefined
            ? { title: updateColumnDto.title }
            : {}),
        },
        include: columnInclude,
      });
    }

    const newPosition = updateColumnDto.position;

    return this.prisma.$transaction(async (tx) => {
      const current = await tx.column.findUniqueOrThrow({ where: { id } });
      const columnCount = await tx.column.count({
        where: { boardId: current.boardId },
      });

      if (newPosition < 0 || newPosition >= columnCount) {
        throw new BadRequestException('Invalid position');
      }

      await this.reorderColumn(
        tx,
        current.boardId,
        id,
        current.position,
        newPosition,
      );

      return tx.column.update({
        where: { id },
        data: {
          position: newPosition,
          ...(updateColumnDto.title !== undefined
            ? { title: updateColumnDto.title }
            : {}),
        },
        include: columnInclude,
      });
    });
  }

  async remove(id: string, userId: string) {
    const column = await this.getColumnOrThrow(id);

    await this.boardAccess.requireBoardRole(
      column.boardId,
      userId,
      BoardRole.EDITOR,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.column.delete({ where: { id } });
      await tx.column.updateMany({
        where: {
          boardId: column.boardId,
          position: { gt: column.position },
        },
        data: { position: { decrement: 1 } },
      });
    });

    return { message: 'Column deleted successfully' };
  }

  private async getColumnOrThrow(id: string) {
    const column = await this.prisma.column.findUnique({
      where: { id },
      select: { id: true, boardId: true, position: true },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return column;
  }

  private async reorderColumn(
    tx: Prisma.TransactionClient,
    boardId: string,
    columnId: string,
    oldPosition: number,
    newPosition: number,
  ) {
    if (oldPosition === newPosition) {
      return;
    }

    if (newPosition < oldPosition) {
      await tx.column.updateMany({
        where: {
          boardId,
          id: { not: columnId },
          position: { gte: newPosition, lt: oldPosition },
        },
        data: { position: { increment: 1 } },
      });
      return;
    }

    await tx.column.updateMany({
      where: {
        boardId,
        id: { not: columnId },
        position: { gt: oldPosition, lte: newPosition },
      },
      data: { position: { decrement: 1 } },
    });
  }
}
