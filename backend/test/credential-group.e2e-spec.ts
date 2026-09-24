import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('Credential Group E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let rootGroupId: string;
  let childGroupId: string;

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

    const email = `group-test-${Date.now()}@example.com`;
    const password = 'TestPassword123!';
    const registerResponse = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .post('/api/auth/register')
      .send({ email, password, name: 'Group Test User' });

    accessToken = (registerResponse.body as { accessToken: string })
      .accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a root credential group', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .post('/api/credential-groups')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Backend Team',
        description: 'Backend credentials',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    const bodyRoot = response.body as {
      id: string;
      name: string;
      parentId: string | null;
    };
    expect(bodyRoot.name).toBe('Backend Team');
    expect(bodyRoot.parentId).toBeNull();

    rootGroupId = bodyRoot.id;
  });

  it('should create a child credential group', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .post('/api/credential-groups')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Staging Servers',
        parentId: rootGroupId,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    const bodyChild = response.body as {
      id: string;
      name: string;
      parentId: string | null;
    };
    expect(bodyChild.name).toBe('Staging Servers');
    expect(bodyChild.parentId).toBe(rootGroupId);

    childGroupId = bodyChild.id;
  });

  it('should reject an invalid parent group', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    await request(app.getHttpServer() as Parameters<typeof request>[0])
      .post('/api/credential-groups')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Invalid Parent',
        parentId: fakeId,
      })
      .expect(404);
  });

  it('should update a credential group', async () => {
    const response = await request(
      app.getHttpServer() as Parameters<typeof request>[0],
    )
      .patch(`/api/credential-groups/${childGroupId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Production Servers',
      })
      .expect(200);

    const bodyUpdate = response.body as {
      id: string;
      name: string;
      parentId: string | null;
    };
    expect(bodyUpdate.id).toBe(childGroupId);
    expect(bodyUpdate.name).toBe('Production Servers');
    expect(bodyUpdate.parentId).toBe(rootGroupId);
  });

  it('should soft delete a credential group', async () => {
    await request(app.getHttpServer() as Parameters<typeof request>[0])
      .delete(`/api/credential-groups/${childGroupId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    await request(app.getHttpServer() as Parameters<typeof request>[0])
      .get(`/api/credential-groups/${childGroupId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });
});
