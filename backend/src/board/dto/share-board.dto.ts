import { IsEmail, IsIn, IsNotEmpty, MaxLength } from 'class-validator';

export class ShareBoardDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @IsIn(['EDITOR', 'VIEWER'])
  role!: 'EDITOR' | 'VIEWER';
}
