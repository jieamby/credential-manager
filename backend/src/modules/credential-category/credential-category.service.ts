import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../database/prisma.service';
import { UpdateCredentialCategoryDto } from './dto/update-credential-category.dto';
import { QueryCredentialCategoryDto } from './dto/query-credential-category.dto';
import { CreateCredentialCategoryDto } from './dto/create-credential-category.dto';
import {
  CredentialCategoryResponseDto,
  PaginatedCredentialCategoryResponseDto,
} from './dto/credential-category-response.dto';

@Injectable()
export class CredentialCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateCredentialCategoryDto,
  ): Promise<CredentialCategoryResponseDto> {
    const category = await this.prisma.credentialCategory.create({
      data: {
        id: randomUUID(),
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return category;
  }

  async findAll(
    query: QueryCredentialCategoryDto,
  ): Promise<PaginatedCredentialCategoryResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const search = query.search?.trim();

    const where: Prisma.CredentialCategoryWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.credentialCategory.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      this.prisma.credentialCategory.count({
        where,
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
      data,
    };
  }

  async findOne(id: string): Promise<CredentialCategoryResponseDto> {
    const category = await this.prisma.credentialCategory.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Credential category not found');
    }

    return category;
  }

  async update(
    id: string,
    dto: UpdateCredentialCategoryDto,
  ): Promise<CredentialCategoryResponseDto> {
    await this.findOne(id);

    const category = await this.prisma.credentialCategory.update({
      where: {
        id,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name.trim(),
        }),
        ...(dto.description !== undefined && {
          description: dto.description.trim() || null,
        }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return category;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.credentialCategory.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
