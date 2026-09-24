import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCredentialGroupDto } from './dto/create-credential-group.dto';
import { QueryCredentialGroupDto } from './dto/query-credential-group.dto';
import {
  CredentialGroupResponseDto,
  PaginatedCredentialGroupResponseDto,
} from './dto/credential-group-response.dto';
import { UpdateCredentialGroupDto } from './dto/update-credential-group.dto';
import { AddGroupMemberDto } from './dto/add-group-member.dto';
import { GroupMemberResponseDto } from './dto/group-member-response.dto';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class CredentialGroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateCredentialGroupDto,
  ): Promise<CredentialGroupResponseDto> {
    const parentId = dto.parentId ?? null;
    const categoryId = dto.categoryId ?? null;

    if (parentId) {
      await this.ensureParentExists(parentId);
      await this.ensureMembership(userId, parentId);
    }

    if (categoryId) {
      await this.ensureCategoryExists(categoryId);
    }

    const group = await this.prisma.$transaction(async (trx) => {
      const created = await trx.credentialGroup.create({
        data: {
          id: randomUUID(),
          name: dto.name.trim(),
          description: dto.description?.trim() || null,
          parentId,
          categoryId,
        },
        select: this.groupSelect(),
      });

      await trx.credentialGroupMember.create({
        data: {
          id: randomUUID(),
          groupId: created.id,
          userId,
          role: 'owner',
        },
      });

      return created;
    });

    return group;
  }

  async findAll(
    userId: string,
    query: QueryCredentialGroupDto,
  ): Promise<PaginatedCredentialGroupResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const search = query.search?.trim();

    const where: Prisma.CredentialGroupWhereInput = {
      deletedAt: null,
      members: {
        some: {
          userId,
          deletedAt: null,
        },
      },
      ...(query.parentId ? { parentId: query.parentId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.credentialGroup.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: this.groupSelect(),
      }),
      this.prisma.credentialGroup.count({ where }),
    ]);

    return {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
      data,
    };
  }

  async findOne(
    userId: string,
    id: string,
  ): Promise<CredentialGroupResponseDto> {
    await this.ensureMembership(userId, id);

    const group = await this.prisma.credentialGroup.findFirst({
      where: { id, deletedAt: null },
      select: this.groupSelect(),
    });

    if (!group) {
      throw new NotFoundException('Credential group not found');
    }

    return group;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateCredentialGroupDto,
  ): Promise<CredentialGroupResponseDto> {
    await this.ensureMembership(userId, id);

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Group cannot be its own parent');
      }

      if (dto.parentId) {
        await this.ensureParentExists(dto.parentId);
        await this.ensureMembership(userId, dto.parentId);
      }
    }

    if (dto.categoryId !== undefined && dto.categoryId !== null) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    return this.prisma.credentialGroup.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description.trim() || null,
        }),
        ...(dto.parentId !== undefined && {
          parentId: dto.parentId || null,
        }),
        ...(dto.categoryId !== undefined && {
          categoryId: dto.categoryId || null,
        }),
      },
      select: this.groupSelect(),
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.ensureOwner(userId, id);

    await this.prisma.credentialGroup.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async listMembers(
    userId: string,
    groupId: string,
  ): Promise<GroupMemberResponseDto[]> {
    await this.ensureMembership(userId, groupId);

    const members = await this.prisma.credentialGroupMember.findMany({
      where: { groupId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        userId: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.user.email,
      name: m.user.name,
      role: m.role,
      createdAt: m.createdAt,
    }));
  }

  async addMember(
    actorId: string,
    groupId: string,
    dto: AddGroupMemberDto,
  ): Promise<GroupMemberResponseDto> {
    await this.ensureOwner(actorId, groupId);

    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id === actorId) {
      throw new BadRequestException('You are already a member of this group');
    }

    const existing = await this.prisma.credentialGroupMember.findFirst({
      where: { groupId, userId: user.id },
    });

    let member;
    if (existing && !existing.deletedAt) {
      throw new BadRequestException('User is already a member of this group');
    }

    if (existing) {
      member = await this.prisma.credentialGroupMember.update({
        where: { id: existing.id },
        data: { deletedAt: null, role: 'member' },
        select: {
          id: true,
          userId: true,
          role: true,
          createdAt: true,
        },
      });
    } else {
      member = await this.prisma.credentialGroupMember.create({
        data: {
          id: randomUUID(),
          groupId,
          userId: user.id,
          role: 'member',
        },
        select: {
          id: true,
          userId: true,
          role: true,
          createdAt: true,
        },
      });
    }

    return {
      id: member.id,
      userId: member.userId,
      email: user.email,
      name: user.name,
      role: member.role,
      createdAt: member.createdAt,
    };
  }

  async removeMember(
    actorId: string,
    groupId: string,
    targetUserId: string,
  ): Promise<void> {
    await this.ensureOwner(actorId, groupId);

    if (actorId === targetUserId) {
      throw new BadRequestException('Owner cannot remove themselves');
    }

    const member = await this.prisma.credentialGroupMember.findFirst({
      where: { groupId, userId: targetUserId, deletedAt: null },
      select: { id: true, role: true },
    });

    if (!member) {
      throw new NotFoundException('Group member not found');
    }

    if (member.role === 'owner') {
      throw new BadRequestException('Cannot remove the group owner');
    }

    await this.prisma.credentialGroupMember.update({
      where: { id: member.id },
      data: { deletedAt: new Date() },
    });
  }

  async ensureMembership(userId: string, groupId: string): Promise<void> {
    const group = await this.prisma.credentialGroup.findFirst({
      where: { id: groupId, deletedAt: null },
      select: { id: true },
    });

    if (!group) {
      throw new NotFoundException('Credential group not found');
    }

    const membership = await this.prisma.credentialGroupMember.findFirst({
      where: { groupId, userId, deletedAt: null },
      select: { id: true },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this group');
    }
  }

  private async ensureOwner(userId: string, groupId: string): Promise<void> {
    await this.ensureMembership(userId, groupId);

    const owner = await this.prisma.credentialGroupMember.findFirst({
      where: { groupId, userId, role: 'owner', deletedAt: null },
      select: { id: true },
    });

    if (!owner) {
      throw new ForbiddenException('Only the group owner can perform this action');
    }
  }

  private async ensureParentExists(parentId: string): Promise<void> {
    const parent = await this.prisma.credentialGroup.findFirst({
      where: { id: parentId, deletedAt: null },
      select: { id: true },
    });

    if (!parent) {
      throw new NotFoundException('Parent credential group not found');
    }
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const category = await this.prisma.credentialCategory.findFirst({
      where: { id: categoryId, deletedAt: null },
      select: { id: true },
    });

    if (!category) {
      throw new NotFoundException('Credential category not found');
    }
  }

  private groupSelect(): Prisma.CredentialGroupSelect {
    return {
      id: true,
      name: true,
      description: true,
      parentId: true,
      categoryId: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
