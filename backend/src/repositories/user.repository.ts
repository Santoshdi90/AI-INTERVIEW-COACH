import { User, Prisma } from '@prisma/client';
import prisma from '../config/database';

export const userRepository = {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  },

  async findByGoogleId(googleId: string): Promise<User | null> {
    return prisma.user.findFirst({ where: { googleId, deletedAt: null } });
  },

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },

  async softDelete(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
  }): Promise<{ users: User[]; total: number }> {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(params.search && {
        OR: [
          { name: { contains: params.search } },
          { email: { contains: params.search } },
        ],
      }),
    };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },

  async countAll(): Promise<number> {
    return prisma.user.count({ where: { deletedAt: null } });
  },
};
