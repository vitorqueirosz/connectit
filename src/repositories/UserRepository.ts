import { PrismaClient } from '@prisma/client';
import { DEFAULT_USER_OBJECT } from 'constants/global';
import { IUser } from 'interfaces/User';
import { UserService, AuthenticationService } from 'services';

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
    const userService = new UserService(this.prisma);

    const userExists = await userService.findUserByEmail(user.email);

    if (userExists) throw new Error(`User ${user.email} already exists`);

    if (user.password !== user.confirmPassword)
      throw new Error('Passwords doesnt match');

    const authenticationService = new AuthenticationService();

    delete user.confirmPassword;

    const hashedPassword = await authenticationService.setPasswordHash(
      user.password,
    );

    const createdUser: IUser = await this.prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
      select: {
        ...DEFAULT_USER_OBJECT,
      },
    });

    return createdUser;
  }
}
