import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

let cachedApp: ReturnType<typeof NestFactory.create> extends Promise<infer T>
  ? T
  : never;

async function bootstrap() {
  if (cachedApp) return cachedApp;

  const app = await NestFactory.create(AppModule, { logger: false });

  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
      : '*',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Credential Manager API')
    .setDescription('API documentation for the Credential Manager application')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.init();
  cachedApp = app;
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance() as (
    req: unknown,
    res: unknown,
  ) => void;
  instance(req, res);
}
