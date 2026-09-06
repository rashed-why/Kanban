import { User as PrismaUser } from '../generated/prisma/client';

export type User = Omit<PrismaUser, 'password'>;

/** User identity attached to authenticated requests (from JWT or login). */
export type AuthUser = Pick<User, 'id' | 'name' | 'email'>;

export type JwtAccessPayload = {
  sub: string;
  email: string;
  name: string;
};

export function userFromJwtPayload(payload: JwtAccessPayload): AuthUser {
  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
  };
}

export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

export function toPublicUser(user: PrismaUser): User {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}
