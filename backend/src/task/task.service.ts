import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BoardRole, Prisma } from '../generated/prisma/client';
import { BoardAccessService } from '../board/board-access.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardAccess: BoardAccessService,
  ) {}

  async create(columnId: string, userId: string, createTaskDto: CreateTaskDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      select: { id: true, boardId: true },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    await this.boardAccess.requireBoardRole(
      column.boardId,
      userId,
      BoardRole.EDITOR,
    );

    return this.prisma.$transaction(async (tx) => {
      const position = await tx.task.count({ where: { columnId } });

      return tx.task.create({
        data: {
          title: createTaskDto.title,
          description: createTaskDto.description,
          columnId,
          position,
        },
      });
    });
  }

  async update(taskId: string, userId: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.getTaskWithBoardOrThrow(taskId);

    await this.boardAccess.requireBoardRole(
      task.column.boardId,
      userId,
      BoardRole.EDITOR,
    );

    if (
      updateTaskDto.title === undefined &&
      updateTaskDto.description === undefined
    ) {
      throw new BadRequestException('No fields to update');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(updateTaskDto.title !== undefined
          ? { title: updateTaskDto.title }
          : {}),
        ...(updateTaskDto.description !== undefined
          ? { description: updateTaskDto.description }
          : {}),
      },
    });
  }

  async remove(taskId: string, userId: string) {
    const task = await this.getTaskWithBoardOrThrow(taskId);

    await this.boardAccess.requireBoardRole(
      task.column.boardId,
      userId,
      BoardRole.EDITOR,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.task.delete({ where: { id: taskId } });
      await tx.task.updateMany({
        where: {
          columnId: task.columnId,
          position: { gt: task.position },
        },
        data: { position: { decrement: 1 } },
      });
    });

    return { message: 'Task deleted successfully' };
  }

  async move(taskId: string, userId: string, moveTaskDto: MoveTaskDto) {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({
        where: { id: taskId },
        select: {
          id: true,
          columnId: true,
          position: true,
          column: { select: { boardId: true } },
        },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      await this.boardAccess.requireBoardRole(
        task.column.boardId,
        userId,
        BoardRole.EDITOR,
      );

      if (task.columnId !== moveTaskDto.fromColumnId) {
        throw new BadRequestException(
          'Task is not in the specified source column',
        );
      }

      const [fromColumn, toColumn] = await Promise.all([
        tx.column.findUnique({
          where: { id: moveTaskDto.fromColumnId },
          select: { id: true, boardId: true },
        }),
        tx.column.findUnique({
          where: { id: moveTaskDto.toColumnId },
          select: { id: true, boardId: true },
        }),
      ]);

      if (!fromColumn || !toColumn) {
        throw new NotFoundException('Column not found');
      }

      if (fromColumn.boardId !== task.column.boardId) {
        throw new BadRequestException(
          'Source column must belong to the same board as the task',
        );
      }

      if (fromColumn.boardId !== toColumn.boardId) {
        throw new BadRequestException(
          'Source and destination columns must belong to the same board',
        );
      }

      const oldPosition = task.position;
      const { newPosition } = moveTaskDto;

      if (moveTaskDto.fromColumnId === moveTaskDto.toColumnId) {
        return this.moveWithinColumn(
          tx,
          taskId,
          moveTaskDto.fromColumnId,
          oldPosition,
          newPosition,
        );
      }

      return this.moveAcrossColumns(
        tx,
        taskId,
        moveTaskDto.fromColumnId,
        moveTaskDto.toColumnId,
        oldPosition,
        newPosition,
      );
    });
  }

  private async moveWithinColumn(
    tx: Prisma.TransactionClient,
    taskId: string,
    columnId: string,
    oldPosition: number,
    newPosition: number,
  ) {
    const taskCount = await tx.task.count({ where: { columnId } });

    if (newPosition < 0 || newPosition >= taskCount) {
      throw new BadRequestException('Invalid position');
    }

    if (oldPosition === newPosition) {
      return tx.task.findUniqueOrThrow({ where: { id: taskId } });
    }

    await this.reorderTaskInColumn(
      tx,
      columnId,
      taskId,
      oldPosition,
      newPosition,
    );

    return tx.task.update({
      where: { id: taskId },
      data: { position: newPosition },
    });
  }

  private async moveAcrossColumns(
    tx: Prisma.TransactionClient,
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    oldPosition: number,
    newPosition: number,
  ) {
    const destinationCount = await tx.task.count({
      where: { columnId: toColumnId },
    });

    if (newPosition < 0 || newPosition > destinationCount) {
      throw new BadRequestException('Invalid position');
    }

    await tx.task.updateMany({
      where: {
        columnId: fromColumnId,
        position: { gt: oldPosition },
      },
      data: { position: { decrement: 1 } },
    });

    await tx.task.updateMany({
      where: {
        columnId: toColumnId,
        position: { gte: newPosition },
      },
      data: { position: { increment: 1 } },
    });

    return tx.task.update({
      where: { id: taskId },
      data: {
        columnId: toColumnId,
        position: newPosition,
      },
    });
  }

  private async reorderTaskInColumn(
    tx: Prisma.TransactionClient,
    columnId: string,
    taskId: string,
    oldPosition: number,
    newPosition: number,
  ) {
    if (newPosition < oldPosition) {
      await tx.task.updateMany({
        where: {
          columnId,
          id: { not: taskId },
          position: { gte: newPosition, lt: oldPosition },
        },
        data: { position: { increment: 1 } },
      });
      return;
    }

    await tx.task.updateMany({
      where: {
        columnId,
        id: { not: taskId },
        position: { gt: oldPosition, lte: newPosition },
      },
      data: { position: { decrement: 1 } },
    });
  }

  private async getTaskWithBoardOrThrow(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        columnId: true,
        position: true,
        column: { select: { boardId: true } },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }
}
