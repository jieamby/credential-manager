import { Module } from '@nestjs/common';
import { CredentialGroupController } from './credential-group.controller';
import { CredentialGroupService } from './credential-group.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [CredentialGroupController],

  providers: [CredentialGroupService, PrismaService],

  exports: [CredentialGroupService],
})
export class CredentialGroupModule {}
