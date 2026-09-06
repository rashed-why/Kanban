import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BoardRole } from '../../generated/prisma/client';
import type { AuthenticatedRequest } from '../../types/authenticated-request';
import { BoardAccessService } from '../board-access.service';
import {
  BOARD_ID_PARAM_KEY,
  BOARD_ROLE_KEY,
} from '../decorators/require-board-role.decorator';

@Injectable()
export class BoardRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly boardAccess: BoardAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.getAllAndOverride<BoardRole>(
      BOARD_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRole) {
      return true;
    }

    const boardIdParam =
      this.reflector.getAllAndOverride<string>(BOARD_ID_PARAM_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'id';

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const boardId = request.params[boardIdParam] as string | undefined;

    if (!boardId) {
      throw new ForbiddenException('Board id is required');
    }

    const role = await this.boardAccess.requireBoardRole(
      boardId,
      request.user.id,
      requiredRole,
    );

    request.boardRole = role;
    request.boardId = boardId;

    return true;
  }
}
