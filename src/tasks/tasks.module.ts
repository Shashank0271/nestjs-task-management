import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './tasks.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  // By including TypeOrmModule.forFeature([Task]) in the imports array of TaskModule,
  // you make the Task entity and its repository (Repository<Task>) available for injection within
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
