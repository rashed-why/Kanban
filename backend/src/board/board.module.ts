import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BoardAccessService } from './board-access.service';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { BoardRoleGuard } from './guards/board-role.guard';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [BoardController],
  providers: [BoardService, BoardAccessService, BoardRoleGuard],
  exports: [BoardService, BoardAccessService, BoardRoleGuard],
})
export class BoardModule {}
