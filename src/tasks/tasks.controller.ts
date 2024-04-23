import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskStatus } from './tasks.model';
import { CreateTaskDto } from './dto/create-task-dto';
import { GetTasksFilterDto } from './dto/get-task-filter-dto';
import { TaskStatusValidationPipe } from './pipes/tasks-status-validation-pipe';
import { TasksModule } from './tasks.module';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getAllTasks(
    @Query(ValidationPipe) getTasksFilterDto: GetTasksFilterDto,
    @GetUser() user: User,
  ) {
    // console.log(Object.keys(getTasksFilterDto))
    if (Object.keys(getTasksFilterDto).length) {
      return this.tasksService.getFilteredTasks(getTasksFilterDto, user);
    } else {
      return this.tasksService.getAllTasks(user);
    }
  }

  @Get('/:id')
  getTaskById(@Param('id') taskId: number, @GetUser() user: User): TasksModule {
    return this.tasksService.getTaskById(taskId, user);
  }

  @Post()
  // @UsePipes(ValidationPipe)
  createTask(
    @Body(ValidationPipe) createTaskDto: CreateTaskDto,
    @GetUser() currentUser: User,
    @Req() req: Request,
  ) {
    return this.tasksService.createTask(createTaskDto, currentUser);
  }

  @Delete('/:id')
  deleteTask(@Param('id') taskId: string , @GetUser() user : User) {
    return this.tasksService.deleteTask(taskId , user);
  }

  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id') taskId: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
    @GetUser() user: User,
  ) {
    return this.tasksService.updateTaskStatus(taskId, status, user);
  }
}
