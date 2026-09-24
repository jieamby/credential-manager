import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('Credential E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let otherAccessToken: string;
  let credentialId: string;
  let categoryId: string;

  const rawPassword = 'MySuperSecretPassword123!';

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

    const email1 = `cred-test1-${Date.now()}@example.com`;
    const registerResponse1 = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .post('/api/auth/register')
      .send({ email: email1, password: 'TestPassword123!', name: 'User One' });
    accessToken = (registerResponse1.body as { accessToken: string })
      .accessToken;

    const email2 = `cred-test2-${Date.now()}@example.com`;
    const registerResponse2 = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .post('/api/auth/register')
      .send({ email: email2, password: 'TestPassword123!', name: 'User Two' });
    otherAccessToken = (registerResponse2.body as { accessToken: string })
      .accessToken;

    const categoryResponse = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .post('/api/credential-categories')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Development' });
    categoryId = (categoryResponse.body as { id: string }).id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a credential', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .post('/api/credentials')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'GitHub',
        username: 'octocat',
        password: rawPassword,
        url: 'https://github.com',
        categoryId: categoryId,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    const bodyCreate = response.body as {
      id: string;
      title: string;
      categoryId: string;
    };
    expect(bodyCreate.title).toBe('GitHub');
    expect(response.body).not.toHaveProperty('password');
    expect(bodyCreate.categoryId).toBe(categoryId);

    credentialId = bodyCreate.id;
  });

  it('should encrypt the credential password', async () => {
    const detailResponse = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .get(`/api/credentials/${credentialId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(detailResponse.body).not.toHaveProperty('password');

    const revealResponse = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .get(`/api/credentials/${credentialId}/reveal`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const bodyReveal = revealResponse.body as { password: string };
    expect(bodyReveal.password).toBe(rawPassword);
  });

  it('should list credentials', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .get('/api/credentials')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const bodyList = response.body as {
      data: { username?: string; categoryId?: string }[];
    };
    expect(bodyList.data).toBeInstanceOf(Array);
    expect(bodyList.data.length).toBeGreaterThan(0);

    bodyList.data.forEach((cred: any) => {
      expect(cred).not.toHaveProperty('password');
    });
  });

  it('should search credentials', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .get('/api/credentials?search=octocat')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const bodySearch = response.body as { data: { username: string }[] };
    expect(bodySearch.data.length).toBeGreaterThan(0);
    expect(bodySearch.data[0].username).toBe('octocat');
  });

  it('should filter credentials', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .get(`/api/credentials?categoryId=${categoryId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const bodyFilter = response.body as { data: { categoryId: string }[] };
    expect(bodyFilter.data.length).toBeGreaterThan(0);
    expect(bodyFilter.data[0].categoryId).toBe(categoryId);
  });

  it('should get credential detail', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .get(`/api/credentials/${credentialId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const bodyGet = response.body as { id: string; title: string };
    expect(bodyGet.id).toBe(credentialId);
    expect(bodyGet.title).toBe('GitHub');
  });

  it('should update a credential', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .patch(`/api/credentials/${credentialId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'GitHub Work',
      })
      .expect(200);

    const bodyUpdate = response.body as { id: string; title: string };
    expect(bodyUpdate.id).toBe(credentialId);
    expect(bodyUpdate.title).toBe('GitHub Work');
  });

  it('should prevent cross-user credential access', async () => {
    await request(app.getHttpServer() as Parameters<typeof request>[0])
      .get(`/api/credentials/${credentialId}`)
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .expect(404);

    await request(app.getHttpServer() as Parameters<typeof request>[0])
      .patch(`/api/credentials/${credentialId}`)
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .send({ title: 'Hacked' })
      .expect(404);
  });

  it('should soft delete a credential', async () => {
    await request(app.getHttpServer() as Parameters<typeof request>[0])
      .delete(`/api/credentials/${credentialId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    await request(app.getHttpServer() as Parameters<typeof request>[0])
      .get(`/api/credentials/${credentialId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
