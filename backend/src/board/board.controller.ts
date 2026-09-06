import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BoardRole } from '../generated/prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../types/authenticated-request';
import { BoardService } from './board.service';
import { RequireBoardRole } from './decorators/require-board-role.decorator';
import { CreateBoardDto } from './dto/create-board.dto';
import { ShareBoardDto } from './dto/share-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardRoleGuard } from './guards/board-role.guard';

@UseGuards(JwtAuthGuard, BoardRoleGuard)
@Controller('boards')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createBoardDto: CreateBoardDto,
  ) {
    return this.boardService.create(req.user.id, createBoardDto);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.boardService.findAllForUser(req.user.id);
  }

  @RequireBoardRole(BoardRole.VIEWER, 'boardId')
  @Get(':boardId/members')
  findMembers(
    @Request() req: AuthenticatedRequest,
    @Param('boardId') boardId: string,
  ) {
    return this.boardService.findMembers(boardId);
  }

  @RequireBoardRole(BoardRole.VIEWER)
  @Get(':id')
  findOne(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.boardService.findOne(id);
  }

  @RequireBoardRole(BoardRole.OWNER)
  @Patch(':id')
  update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ) {
    return this.boardService.update(id, updateBoardDto);
  }

  @RequireBoardRole(BoardRole.OWNER)
  @Delete(':id')
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.boardService.remove(id);
  }

  @RequireBoardRole(BoardRole.OWNER, 'boardId')
  @Post(':boardId/share')
  share(
    @Request() req: AuthenticatedRequest,
    @Param('boardId') boardId: string,
    @Body() shareBoardDto: ShareBoardDto,
  ) {
    return this.boardService.share(boardId, req.user.id, shareBoardDto);
  }

  @RequireBoardRole(BoardRole.OWNER, 'boardId')
  @Delete(':boardId/members/:userId')
  removeMember(
    @Request() req: AuthenticatedRequest,
    @Param('boardId') boardId: string,
    @Param('userId') userId: string,
  ) {
    return this.boardService.removeMember(boardId, userId);
  }
}
