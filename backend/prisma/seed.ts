import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Starting seed...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be configured');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Administrator',
      passwordHash,
      deletedAt: null,
    },
    create: {
      id: randomUUID(),
      email: adminEmail,
      name: 'Administrator',
      passwordHash,
    },
  });

  console.log(`Admin user: ${admin.email}`);

  const categories = [
    { name: 'Work', description: 'Work-related credentials' },
    { name: 'Personal', description: 'Personal credentials' },
    { name: 'Finance', description: 'Financial credentials' },
  ];

  const categoryIds: Record<string, string> = {};

  for (const category of categories) {
    const existing = await prisma.credentialCategory.findFirst({
      where: { name: category.name, deletedAt: null },
    });

    if (existing) {
      categoryIds[category.name] = existing.id;
    } else {
      const created = await prisma.credentialCategory.create({
        data: {
          id: randomUUID(),
          name: category.name,
          description: category.description,
        },
      });
      categoryIds[category.name] = created.id;
    }
  }

  console.log(`Categories: ${categories.length}`);

  const ensureGroup = async (input: {
    name: string;
    description: string;
    parentId?: string | null;
    categoryId?: string | null;
  }) => {
    const existing = await prisma.credentialGroup.findFirst({
      where: {
        name: input.name,
        parentId: input.parentId ?? null,
        deletedAt: null,
      },
    });

    if (existing) {
      if (input.categoryId && !existing.categoryId) {
        await prisma.credentialGroup.update({
          where: { id: existing.id },
          data: { categoryId: input.categoryId },
        });
      }
      return existing;
    }

    return prisma.credentialGroup.create({
      data: {
        id: randomUUID(),
        name: input.name,
        description: input.description,
        parentId: input.parentId ?? null,
        categoryId: input.categoryId ?? null,
      },
    });
  };

  const ensureMembership = async (groupId: string, userId: string) => {
    const existing = await prisma.credentialGroupMember.findFirst({
      where: { groupId, userId },
    });

    if (existing) {
      if (existing.deletedAt) {
        await prisma.credentialGroupMember.update({
          where: { id: existing.id },
          data: { deletedAt: null, role: 'owner' },
        });
      }
      return;
    }

    await prisma.credentialGroupMember.create({
      data: {
        id: randomUUID(),
        groupId,
        userId,
        role: 'owner',
      },
    });
  };

  const workGroup = await ensureGroup({
    name: 'Work',
    description: 'Work-related credentials',
    categoryId: categoryIds.Work,
  });

  const personalGroup = await ensureGroup({
    name: 'Personal',
    description: 'Personal credentials',
    categoryId: categoryIds.Personal,
  });

  const childGroups = [
    {
      name: 'Development',
      description: 'Development-related credentials',
      parentId: workGroup.id,
      categoryId: categoryIds.Work,
    },
    {
      name: 'Production',
      description: 'Production-related credentials',
      parentId: workGroup.id,
      categoryId: categoryIds.Work,
    },
    {
      name: 'Social Media',
      description: 'Social media credentials',
      parentId: personalGroup.id,
      categoryId: categoryIds.Personal,
    },
  ];

  const allGroups = [workGroup, personalGroup];

  for (const group of childGroups) {
    const created = await ensureGroup(group);
    allGroups.push(created);
  }

  for (const group of allGroups) {
    await ensureMembership(group.id, admin.id);
  }

  const orphanGroups = await prisma.credentialGroup.findMany({
    where: {
      deletedAt: null,
      members: { none: { deletedAt: null } },
    },
    select: { id: true },
  });

  for (const group of orphanGroups) {
    await ensureMembership(group.id, admin.id);
  }

  console.log('Groups created');
  console.log('Database seed completed successfully.');
  console.log('');
  console.log('Development login:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
}

main()
  .catch((error: unknown) => {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
