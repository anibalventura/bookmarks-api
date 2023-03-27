import { GetUser } from './../auth/decorator/get-user.decorator';
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';
import { UserService } from './user.service';
import { EditUserDto } from './dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async getMe(@GetUser() user: User) {
    return user;
  }

  @Patch('me')
  async updateMe(@GetUser('id') id: number, @Body() dto: EditUserDto) {
    return this.userService.updateUser(id, dto);
  }
}
