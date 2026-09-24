import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CredentialCategoryModule } from './modules/credential-category/credential-category.module';
import { CredentialGroupModule } from './modules/credential-group/credential-group.module';
import { EncryptionModule } from './common/encryption/encryption.module';
import { CredentialModule } from './modules/credential/credential.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 60,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EncryptionModule,
    PrismaModule,
    AuthModule,
    CredentialCategoryModule,
    CredentialGroupModule,
    CredentialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
