import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class MoveTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  fromColumnId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  toColumnId!: string;

  @IsInt()
  @Min(0)
  newPosition!: number;
}
