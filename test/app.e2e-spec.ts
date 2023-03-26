import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DbService } from '../src/db/db.service';

describe('App e2e', () => {
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

    // Get the DbService instance
    db = app.get(DbService);

    // Clear the database
    await db.cleanDb();
  });

  afterAll(async () => {
    // Close the application
    await app.close();
  });

  it.todo('should pass');
});
