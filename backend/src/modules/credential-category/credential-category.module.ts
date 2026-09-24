import { Module } from '@nestjs/common';
import { CredentialCategoryController } from './credential-category.controller';
import { CredentialCategoryService } from './credential-category.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [CredentialCategoryController],

  providers: [CredentialCategoryService, PrismaService],

  exports: [CredentialCategoryService],
})
export class CredentialCategoryModule {}
