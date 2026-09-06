import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  JwtAccessPayload,
  userFromJwtPayload,
  type AuthUser,
} from '../../types/user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('JWT_SECRET'),
    });
  }

  validate(payload: JwtAccessPayload): AuthUser {
    if (!payload.sub || !payload.email || !payload.name) {
      throw new UnauthorizedException();
    }

    return userFromJwtPayload(payload);
  }
}
