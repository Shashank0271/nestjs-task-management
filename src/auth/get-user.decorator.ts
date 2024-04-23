import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from './user.entity'; // Update the path to your User entity

export const GetUser = createParamDecorator(
  (data, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
