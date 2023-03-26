import { GetUser } from './../auth/decorator/get-user.decorator';
import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  @Get('me')
  async getMe(@GetUser() user: User) {
    return user;
  }

  @Patch('me')
  async updateMe(@GetUser() user: User) {
    return user;
  }
}
