import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BoardRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../types/user';
import { CreateBoardDto } from './dto/create-board.dto';
import { ShareBoardDto } from './dto/share-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

const boardListInclude = {
  owner: { select: publicUserSelect },
  members: {
    include: {
      user: { select: publicUserSelect },
    },
  },
} as const;

const boardDetailInclude = {
  owner: { select: publicUserSelect },
  members: {
    include: {
      user: { select: publicUserSelect },
    },
  },
  columns: {
    orderBy: { position: 'asc' as const },
    include: {
      tasks: {
        orderBy: { position: 'asc' as const },
      },
    },
  },
} as const;

@Injectable()
export class BoardService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, createBoardDto: CreateBoardDto) {
    return this.prisma.board.create({
      data: {
        title: createBoardDto.title,
        ownerId: userId,
      },
      include: boardDetailInclude,
    });
  }

  findAllForUser(userId: string) {
    return this.prisma.board.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: boardListInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.board.findUniqueOrThrow({
      where: { id },
      include: boardDetailInclude,
    });
  }

  update(id: string, updateBoardDto: UpdateBoardDto) {
    return this.prisma.board.update({
      where: { id },
      data: { title: updateBoardDto.title },
      include: boardDetailInclude,
    });
  }

  async remove(id: string) {
    await this.prisma.board.delete({ where: { id } });

    return { message: 'Board deleted successfully' };
  }

  async findMembers(boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: {
        ownerId: true,
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return [
      {
        userId: board.ownerId,
        name: board.owner.name,
        email: board.owner.email,
        role: BoardRole.OWNER,
      },
      ...board.members.map((member) => ({
        userId: member.userId,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
      })),
    ];
  }

  async share(boardId: string, userId: string, shareBoardDto: ShareBoardDto) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { ownerId: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: shareBoardDto.email },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === board.ownerId) {
      throw new BadRequestException('Board owner already has full access');
    }

    if (user.id === userId) {
      throw new BadRequestException('You cannot share a board with yourself');
    }

    const existingMember = await this.prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User already has access to this board');
    }

    await this.prisma.boardMember.create({
      data: {
        boardId,
        userId: user.id,
        role: shareBoardDto.role,
      },
    });

    return {
      success: true,
      message: 'Board shared successfully',
    };
  }

  async removeMember(boardId: string, memberUserId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { ownerId: true },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    if (memberUserId === board.ownerId) {
      throw new BadRequestException('Cannot remove the board owner');
    }

    const member = await this.prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: memberUserId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    await this.prisma.boardMember.delete({
      where: { id: member.id },
    });

    return {
      success: true,
      message: 'Member removed successfully',
    };
  }
}
