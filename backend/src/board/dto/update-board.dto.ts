import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateBoardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;
}
