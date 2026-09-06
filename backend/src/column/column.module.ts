import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BoardModule } from '../board/board.module';
import { BoardColumnController } from './board-column.controller';
import { ColumnController } from './column.controller';
import { ColumnService } from './column.service';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => BoardModule)],
  controllers: [BoardColumnController, ColumnController],
  providers: [ColumnService],
  exports: [ColumnService],
})
export class ColumnModule {}
