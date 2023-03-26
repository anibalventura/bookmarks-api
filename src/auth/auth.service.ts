import { ForbiddenException, Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(private db: DbService) {}

  async signUp(dto: AuthDto) {
    // Check if the user already exists
    const userExists = await this.db.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (userExists) throw new ForbiddenException('User already exists');

    // Hash the password
    dto.password = await argon.hash(dto.password);

    // Create the user
    const user = await this.db.user.create({
      data: {
        email: dto.email,
        passwordHash: dto.password,
      },
    });

    // Delete the password hash
    delete user.passwordHash;

    // Return the user
    return {
      data: user,
    };
  }

  async signIn(dto: AuthDto) {
    // Find the user by email
    const user = await this.db.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // Check if the user exists
    if (!user) throw new ForbiddenException('Invalid credentials');

    // Check if the password is correct
    const passwordCorrect = await argon.verify(user.passwordHash, dto.password);
    if (!passwordCorrect) throw new ForbiddenException('Invalid credentials');

    // Delete the password hash
    delete user.passwordHash;

    // Return the user
    return {
      data: user,
    };
  }
}
