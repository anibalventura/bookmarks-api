import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { DbService } from '../src/db/db.service';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

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

    // Set the pactum spec base url
    pactum.request.setBaseUrl(url);
  });

  afterAll(async () => {
    // Close the application
    await app.close();
  });

  describe('- Auth', () => {
    const dto: AuthDto = {
      email: 'anibal@email.com',
      password: '1234567',
    };

    describe('- Signup', () => {
      const baseUrl = '/auth/sign-up';

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

    describe('- Signin', () => {
      const baseUrl = '/auth/sign-in';

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
          .stores('userAt', 'token');
      });
    });
  });

  describe('- User', () => {
    const baseUrl = '/users/me';

    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get(baseUrl)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      const dto: EditUserDto = {
        firstName: 'Anibal',
        email: 'anibal@email.com',
      };

      it('should edit user', () => {
        return pactum
          .spec()
          .patch(baseUrl)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('- Bookmarks', () => {
    const baseUrl = '/bookmarks';

    describe('- Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get(`${baseUrl}`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('- Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube.com/watch?v=d6WC5n9G_sM',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post(`${baseUrl}`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('- Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get(`${baseUrl}`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('- Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get(`${baseUrl}/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('- Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title:
          'Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)',
        description:
          'Learn how to use Kubernetes in this complete course. Kubernetes makes it possible to containerize applications and simplifies app deployment to production.',
      };
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch(`${baseUrl}/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('- Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete(`${baseUrl}/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get(`${baseUrl}`)
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
