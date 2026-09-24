import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService {
  constructor(private readonly prisma: PrismaClient) {}

  async checkConnection(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }
}
