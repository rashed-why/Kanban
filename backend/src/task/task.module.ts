import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BoardModule } from '../board/board.module';
import { ColumnTaskController } from './column-task.controller';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => BoardModule)],
  controllers: [ColumnTaskController, TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
