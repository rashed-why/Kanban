import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toPublicUser, type AuthUser } from '../types/user';

type DbClient = PrismaService | Prisma.TransactionClient;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /** Called after LocalStrategy validates email/password. Issues access + refresh tokens. */
  async login(user: AuthUser) {
    return await this.issueTokens(user);
  }

  /**
   * Validates the refresh token, rotates it (delete old → issue new pair),
   * and returns fresh access + refresh tokens.
   *
   * Uses a transaction plus deleteMany count check so only one concurrent
   * refresh request can consume the same token.
   */
  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    return await this.prisma.$transaction(async (tx) => {
      const stored = await tx.refreshToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (!stored) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (stored.expiresAt < new Date()) {
        await tx.refreshToken.deleteMany({ where: { id: stored.id } });
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { count } = await tx.refreshToken.deleteMany({
        where: {
          id: stored.id,
          tokenHash,
          expiresAt: { gt: new Date() },
        },
      });

      if (count !== 1) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.issueTokens(toPublicUser(stored.user), tx);
    });
  }

  /**
   * Revokes refresh token(s). With refreshToken — deletes that session only.
   * Without — deletes all refresh tokens for the user (client logout via JWT).
   */
  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const stored = await this.prisma.refreshToken.findUnique({
        where: { tokenHash: this.hashToken(refreshToken) },
      });

      if (!stored || stored.userId !== userId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    } else {
      await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }

    return { message: 'Logged out successfully' };
  }

  /** Shared by login and refresh — always creates a new token pair. */
  private async issueTokens(user: AuthUser, client: DbClient = this.prisma) {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.createRefreshToken(user, client);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  /** Expiry comes from JWT_EXPIRES_IN in auth.module.ts (default: 1h). */
  private async generateAccessToken(user: AuthUser) {
    return this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
    });
  }

  /**
   * Generates a random opaque token, stores its SHA-256 hash in the DB,
   * and returns the plain token to the client. Called on both login and refresh.
   */
  private async createRefreshToken(
    user: Pick<AuthUser, 'id' | 'email'>,
    client: DbClient = this.prisma,
  ) {
    const refreshToken = randomBytes(64).toString('hex');
    const expiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    await client.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        userId: user.id,
        email: user.email,
        expiresAt: this.getExpiryDate(expiresIn),
      },
    });

    return refreshToken;
  }

  /** SHA-256 is sufficient for high-entropy random tokens (unlike passwords, which use bcrypt). */
  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  /** Parses env values like "7d", "1h", "30m" into a Date. */
  private getExpiryDate(expiresIn: string) {
    const units = { d: 86_400_000, h: 3_600_000, m: 60_000, s: 1_000 };
    const [, n = '7', u = 'd'] = expiresIn.match(/^(\d+)([dhms])$/) ?? [];

    return new Date(Date.now() + Number(n) * units[u as keyof typeof units]);
  }
}
