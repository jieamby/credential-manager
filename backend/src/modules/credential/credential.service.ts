import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EncryptionService } from '../../common/encryption/encryption.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import {
  CredentialResponseDto,
  PaginatedCredentialResponseDto,
} from './dto/credential-response.dto';
import { randomUUID } from 'node:crypto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { QueryCredentialDto } from './dto/query-credential.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CredentialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async create(
    userId: string,
    dto: CreateCredentialDto,
  ): Promise<CredentialResponseDto> {
    const resolved = await this.resolveRelations(
      userId,
      dto.groupId,
      dto.categoryId,
    );

    const encrypted = this.encryptionService.encrypt(dto.password);

    const credential = await this.prisma.credential.create({
      data: {
        id: randomUUID(),
        title: dto.title.trim(),
        username: dto.username?.trim() || null,
        url: dto.url?.trim() || null,
        notes: dto.notes?.trim() || null,
        encryptedPassword: encrypted.encryptedPassword,
        encryptionIv: encrypted.encryptionIv,
        encryptionTag: encrypted.encryptionTag,
        userId,
        groupId: resolved.groupId,
        categoryId: resolved.categoryId,
      },
      select: this.responseSelect(),
    });

    return credential;
  }

  async findAll(
    userId: string,
    query: QueryCredentialDto,
  ): Promise<PaginatedCredentialResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const search = query.search?.trim();
    const where: Prisma.CredentialWhereInput = {
      userId,
      deletedAt: null,
      ...(query.groupId ? { groupId: query.groupId } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { username: { contains: search, mode: 'insensitive' } },
              { url: { contains: search, mode: 'insensitive' } },
              { notes: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.credential.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: this.responseSelect(),
      }),
      this.prisma.credential.count({ where }),
    ]);
    return { page, limit, total, totalPage: Math.ceil(total / limit), data };
  }

  async findOne(userId: string, id: string): Promise<CredentialResponseDto> {
    const credential = await this.prisma.credential.findFirst({
      where: { id, userId, deletedAt: null },
      select: this.responseSelect(),
    });
    if (!credential) {
      throw new NotFoundException('Credential not found');
    }
    return credential;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCredentialDto,
  ): Promise<CredentialResponseDto> {
    await this.findOne(userId, id);

    const resolved = await this.resolveRelations(
      userId,
      dto.groupId,
      dto.categoryId,
      dto.groupId !== undefined || dto.categoryId !== undefined,
    );

    const data: Prisma.CredentialUpdateInput = {};
    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }
    if (dto.username !== undefined) {
      data.username = dto.username.trim() || null;
    }
    if (dto.url !== undefined) {
      data.url = dto.url.trim() || null;
    }
    if (dto.notes !== undefined) {
      data.notes = dto.notes.trim() || null;
    }
    if (dto.groupId !== undefined) {
      data.group = resolved.groupId
        ? { connect: { id: resolved.groupId } }
        : { disconnect: true };
    }
    if (dto.categoryId !== undefined || dto.groupId !== undefined) {
      data.category = resolved.categoryId
        ? { connect: { id: resolved.categoryId } }
        : { disconnect: true };
    }
    if (dto.password !== undefined) {
      const encrypted = this.encryptionService.encrypt(dto.password);
      data.encryptedPassword = encrypted.encryptedPassword;
      data.encryptionIv = encrypted.encryptionIv;
      data.encryptionTag = encrypted.encryptionTag;
    }
    return this.prisma.credential.update({
      where: { id },
      data,
      select: this.responseSelect(),
    });
  }
  async remove(userId: string, id: string): Promise<void> {
    await this.findOne(userId, id);
    await this.prisma.credential.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
  async reveal(userId: string, id: string): Promise<{ password: string }> {
    const credential = await this.prisma.credential.findFirst({
      where: { id, userId, deletedAt: null },
      select: {
        encryptedPassword: true,
        encryptionIv: true,
        encryptionTag: true,
      },
    });

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    const password = this.encryptionService.decrypt(
      credential.encryptedPassword,
      credential.encryptionIv,
      credential.encryptionTag,
    );

    return { password };
  }
  /**
   * Resolves group/category for create/update.
   * If the group has a category, it wins when categoryId is omitted.
   * User must be a member of the group to attach a credential to it.
   */
  private async resolveRelations(
    userId: string,
    groupId?: string | null,
    categoryId?: string | null,
    apply = true,
  ): Promise<{ groupId: string | null; categoryId: string | null }> {
    if (!apply) {
      return { groupId: groupId ?? null, categoryId: categoryId ?? null };
    }

    let resolvedGroupId: string | null =
      groupId === undefined ? null : groupId || null;
    let resolvedCategoryId: string | null =
      categoryId === undefined ? null : categoryId || null;

    if (groupId) {
      const group = await this.prisma.credentialGroup.findFirst({
        where: { id: groupId, deletedAt: null },
        select: { id: true, categoryId: true },
      });
      if (!group) {
        throw new NotFoundException('Credential group not found');
      }

      const membership = await this.prisma.credentialGroupMember.findFirst({
        where: { groupId, userId, deletedAt: null },
        select: { id: true },
      });
      if (!membership) {
        throw new NotFoundException('Credential group not found');
      }

      resolvedGroupId = group.id;
      if (!categoryId && group.categoryId) {
        resolvedCategoryId = group.categoryId;
      }
    }

    if (resolvedCategoryId) {
      const category = await this.prisma.credentialCategory.findFirst({
        where: { id: resolvedCategoryId, deletedAt: null },
        select: { id: true },
      });
      if (!category) {
        throw new NotFoundException('Credential category not found');
      }
    }

    return { groupId: resolvedGroupId, categoryId: resolvedCategoryId };
  }
  private responseSelect(): Prisma.CredentialSelect {
    return {
      id: true,
      title: true,
      username: true,
      url: true,
      notes: true,
      groupId: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
