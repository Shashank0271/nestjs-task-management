import {
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { TaskStatus } from '../tasks.model';

export class TaskStatusValidationPipe implements PipeTransform {
  readonly taskStatuses = [
    TaskStatus.DONE,
    TaskStatus.IN_PROGRESS,
    TaskStatus.OPEN,
  ];
  transform(value: any) {
    value = value.toUpperCase();
    if (!this.isStatusValid(value)) {
      return new BadRequestException(`${value} is an invalid status`);
    }
    return value;
  }
  private isStatusValid(status: any) {
    const index = this.taskStatuses.indexOf(status);
    return index !== -1;
  }
}
