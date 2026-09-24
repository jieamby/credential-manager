import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('Credential Category E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let categoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const email = `category-test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    const registerResponse = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .post('/api/auth/register')
      .send({ email, password, name: 'Category Test User' });

    accessToken = (registerResponse.body as { accessToken: string })
      .accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a credential category', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .post('/api/credential-categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Work',
        description: 'Office credentials',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    const bodyCreate = response.body as {
      id: string;
      name: string;
      description: string;
    };
    expect(bodyCreate.name).toBe('Work');
    expect(bodyCreate.description).toBe('Office credentials');

    categoryId = bodyCreate.id;
  });

  it('should list credential categories', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .get('/api/credential-categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const bodyList = response.body as { data: { name: string }[] };
    expect(bodyList.data).toBeInstanceOf(Array);
    expect(bodyList.data.length).toBeGreaterThan(0);
    expect(bodyList.data[0]).toHaveProperty('name');
  });

  it('should get credential category detail', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .get(`/api/credential-categories/${categoryId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const bodyGet = response.body as { id: string; name: string };
    expect(bodyGet.id).toBe(categoryId);
    expect(bodyGet.name).toBe('Work');
  });

  it('should update a credential category', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .patch(`/api/credential-categories/${categoryId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Personal',
      })
      .expect(200);

    const bodyUpdate = response.body as {
      id: string;
      name: string;
      description: string;
    };
    expect(bodyUpdate.id).toBe(categoryId);
    expect(bodyUpdate.name).toBe('Personal');
    expect(bodyUpdate.description).toBe('Office credentials');
  });

  it('should soft delete a credential category', async () => {
    await request(app.getHttpServer() as Parameters<typeof request>[0])
      .delete(`/api/credential-categories/${categoryId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    await request(app.getHttpServer() as Parameters<typeof request>[0])
      .get(`/api/credential-categories/${categoryId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
