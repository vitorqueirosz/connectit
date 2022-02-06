import { PrismaClient } from '@prisma/client';
import { IUser } from 'interfaces/User';

interface IUserRepository {
  create: (user: IUser) => Promise<IUser>;
  update?: (userId: string) => Promise<IUser>;
}

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // async update(userId: string) {}

  async create(user: IUser) {
    const userExists = await this.prisma.user.findFirst({
      where: { email: user.email },
    });

    if (userExists) throw new Error(`User ${user.email} already exists`);

    if (user.password !== user.confirmPassword)
      throw new Error('Passwords doesnt match');

    delete user.confirmPassword;

    const createdUser: IUser = await this.prisma.user.create({
      data: {
        ...user,
      },
    });

    return createdUser;
  }
}
