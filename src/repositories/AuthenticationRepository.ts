import { PrismaClient, User } from '@prisma/client';
import { UserService, AuthenticationService } from 'services';

interface AuthenticationResponse {
  user: User;
  token: string;
}

interface AuthenticationPayload {
  email: string;
  password: string;
}
interface IAuthenticationRepository {
  authenticate: (
    payload: AuthenticationPayload,
  ) => Promise<AuthenticationResponse>;
}

export class AuthenticationRepository implements IAuthenticationRepository {
  constructor(private prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async authenticate({ email, password }: AuthenticationPayload) {
    const userService = new UserService(this.prisma);
    const authenticationService = new AuthenticationService();

    const userExists = await userService.findUserByEmail(email);

    if (!userExists) throw new Error('Invalid credentials');

    const compareUserPasswords = await authenticationService.comparePasswords(
      password,
      userExists.password,
    );

    if (!compareUserPasswords) throw new Error('Invalid credentials');

    const userToken = authenticationService.generateToken(userExists.id);

    return {
      user: userExists,
      token: userToken,
    };
  }
}
