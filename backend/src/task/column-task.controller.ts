import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../types/authenticated-request';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskService } from './task.service';

@UseGuards(JwtAuthGuard)
@Controller('columns/:columnId/tasks')
export class ColumnTaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(
    @Request() req: AuthenticatedRequest,
    @Param('columnId') columnId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.taskService.create(columnId, req.user.id, createTaskDto);
  }
}
