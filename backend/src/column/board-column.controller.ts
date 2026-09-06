import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BoardRole } from '../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequireBoardRole } from '../board/decorators/require-board-role.decorator';
import { BoardRoleGuard } from '../board/guards/board-role.guard';
import type { AuthenticatedRequest } from '../types/authenticated-request';
import { ColumnService } from './column.service';
import { CreateColumnDto } from './dto/create-column.dto';

@UseGuards(JwtAuthGuard, BoardRoleGuard)
@Controller('boards/:boardId/columns')
export class BoardColumnController {
  constructor(private readonly columnService: ColumnService) {}

  @RequireBoardRole(BoardRole.EDITOR, 'boardId')
  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Param('boardId') boardId: string,
    @Body() createColumnDto: CreateColumnDto,
  ) {
    return this.columnService.create(boardId, createColumnDto);
  }
}
