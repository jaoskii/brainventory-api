import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const { username, password } = request.body as Record<string, unknown>;

    if (!username || !password) {
      throw new BadRequestException('username and password are required');
    }

    return true;
  }
}
