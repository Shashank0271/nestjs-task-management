import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './tasks.model';
import { CreateTaskDto } from './dto/create-task-dto';
import { GetTasksFilterDto } from './dto/get-task-filter-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task as TaskEntity } from './tasks.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
  ) {}

  async getAllTasks(currentUser: User) {
    const query = this.taskRepository.createQueryBuilder('task');
    query.andWhere('task.userId = :userId', { userId: currentUser.id });
    return await query.getMany();
  }

  async getTaskById(taskId: number, currentUser: User) {
    // const task = await this.taskRepository.findOne({
    //   where: {
    //     id: taskId,
    //   },
    //   // relations: {
    //   //   user: true,
    //   // },
    // });
    const query = this.taskRepository.createQueryBuilder('task');
    query.where('task.userId = :userId', { userId: currentUser.id });
    query.andWhere('task.id = :taskId', { taskId });
    const task = await query.getOne();
    if (!task) {
      throw new NotFoundException(`Task with id : ${taskId} not found`);
    } else {
      return task;
    }
  }

  async createTask(createTaskDto: CreateTaskDto, currentUser: User) {
    const { title, description } = createTaskDto;
    const task: TaskEntity = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user: currentUser,
    });
    const savedTask = await this.taskRepository.save(task);
    delete savedTask.user;
    return savedTask;
  }

  async deleteTask(taskId: string, currentUser: User) {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .delete()
      .from('task')
      .where('task.id = :taskId', { taskId: taskId });
    query.andWhere('"task"."userId" = :userId', { userId: currentUser.id });

    const result = await query.execute();

    if (result.affected === 0) {
      throw new NotFoundException(
        `Task with ID: ${taskId} not found for user with ID: ${currentUser.id}`,
      );
    }
  }

  async updateTaskStatus(taskId: number, status: TaskStatus, user: User) {
    const { affected } = await this.taskRepository.update(
      { id: taskId, user },
      { status: status },
    );
    if (!affected) {
      throw new NotFoundException(
        `task with id ${taskId} does not exist for user ${user.username}`,
      );
    }
    return await this.taskRepository.findOneBy({ id: taskId });
  }

  async getFilteredTasks(
    getTaskFilterDto: GetTasksFilterDto,
    currentUser: User,
  ) {
    const { status, search } = getTaskFilterDto;
    const query = this.taskRepository.createQueryBuilder('task');
    query.where('task.userId = :userId', { userId: currentUser.id });

    if (status) {
      query.andWhere('task.status = :status', { status: status });
    }

    if (search) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    return await query.getMany();
  }
}
