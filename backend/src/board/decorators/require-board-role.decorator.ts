import { applyDecorators, SetMetadata } from '@nestjs/common';
import { BoardRole } from '../../generated/prisma/client';

export const BOARD_ROLE_KEY = 'boardRole';
export const BOARD_ID_PARAM_KEY = 'boardIdParam';

export const RequireBoardRole = (
  role: BoardRole,
  boardIdParam = 'id',
) =>
  applyDecorators(
    SetMetadata(BOARD_ROLE_KEY, role),
    SetMetadata(BOARD_ID_PARAM_KEY, boardIdParam),
  );
