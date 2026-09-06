import { IsOptional, IsString, MaxLength } from 'class-validator';

export class LogoutDto {
  @IsString()
  @IsOptional()
  @MaxLength(128)
  refreshToken?: string;
}
