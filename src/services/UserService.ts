import { PrismaClient, User } from '@prisma/client';

interface IUserService {
  findUserByEmail: (email: string) => Promise<User | null>;
}

export class UserService implements IUserService {
  constructor(private prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findUserByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    return user;
  }

  async findUserById(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id },
    });

    return user;
  }
}
