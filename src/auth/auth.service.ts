import { ForbiddenException, Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private config: ConfigService,
    private db: DbService,
    private jwt: JwtService,
  ) {}

  private async signToken(
    userId: number,
    email: string,
  ): Promise<{ token: string }> {
    const payload = { sub: userId, email };

    const token = this.jwt.sign(payload, {
      expiresIn: '1d',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      token,
    };
  }

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

    // Return the token
    return await this.signToken(user.id, user.email);
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

    // Return the token
    return await this.signToken(user.id, user.email);
  }
}
