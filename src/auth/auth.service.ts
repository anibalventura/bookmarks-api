import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';

@Injectable()
export class AuthService {
  constructor(private db: DbService) {}

  signIn() {
    return {
      msg: 'This action returns a sign-in token',
    };
  }

  signUp() {
    return {
      msg: 'This action creates a new user',
    };
  }
}
