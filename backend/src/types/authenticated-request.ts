import type { Request as ExpressRequest } from 'express';
import type { BoardRole } from '../generated/prisma/client';
import type { AuthUser } from './user';

export type AuthenticatedRequest = ExpressRequest & {
  user: AuthUser;
  boardRole?: BoardRole;
  boardId?: string;
};
