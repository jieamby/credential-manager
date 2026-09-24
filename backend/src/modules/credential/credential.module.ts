import { Module } from '@nestjs/common';
import { CredentialController } from './credential.controller';
import { CredentialService } from './credential.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [CredentialController],
  providers: [CredentialService, PrismaService],
  exports: [CredentialService],
})
export class CredentialModule {}
