import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { DbService } from '../src/db/db.service';
import { AuthDto } from '../src/auth/dto';

describe('App e2e', () => {
  const port = 3333;
  const url = `http://localhost:${port}`;
  let app: INestApplication;
  let db: DbService;

  beforeAll(async () => {
    // Create a module reference for testing
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Create a NestJS application instance
    app = moduleRef.createNestApplication();

    // Configure the application
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    // Start the application
    await app.init();
    await app.listen(port);

    // Get the DbService instance
    db = app.get(DbService);

    // Clear the database
    await db.cleanDb();
  });

  afterAll(async () => {
    // Close the application
    await app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'anibal@email.com',
      password: '1234567',
    };

    describe('Signup', () => {
      const baseUrl = `${url}/auth/sign-up`;

      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post(baseUrl)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post(baseUrl)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum.spec().post(baseUrl).expectStatus(400);
      });

      it('should signup', () => {
        return pactum.spec().post(baseUrl).withBody(dto).expectStatus(201);
      });
    });

    describe('Signin', () => {
      const baseUrl = `${url}/auth/sign-in`;

      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post(baseUrl)
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post(baseUrl)
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum.spec().post(baseUrl).expectStatus(400);
      });

      it('should signin', () => {
        return pactum
          .spec()
          .post(baseUrl)
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {});

  describe('Bookmark', () => {});
});
