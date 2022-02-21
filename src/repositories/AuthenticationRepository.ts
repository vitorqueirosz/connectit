import request from 'request';
import { PrismaClient, User } from '@prisma/client';
import { UserService, AuthenticationService } from 'services';
import { SetSpotifyTokens } from 'interfaces/User';

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

  async setSpotifyTokens({
    user_id,
    access_token,
    refresh_token,
  }: SetSpotifyTokens) {
    const userService = new UserService(this.prisma);

    const userExists = await userService.findUserById(user_id);

    if (!userExists) throw new Error(`User not found`);

    await this.prisma.user.update({
      where: { id: user_id },
      data: {
        access_spotify_token: access_token,
        refresh_spotify_token: refresh_token,
      },
    });
  }

  async getSpotifyAcessToken(user_id: number) {
    const userService = new UserService(this.prisma);

    const userExists = await userService.findUserById(user_id);

    if (!userExists) throw new Error(`User not found`);

    return userExists.access_spotify_token;
  }

  async refreshSpotifyToken(user_id: number) {
    const userService = new UserService(this.prisma);

    const user = await userService.findUserById(user_id);

    if (!user) throw new Error('User not found');

    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
        ).toString('base64')}`,
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: user.refresh_spotify_token,
      },
      json: true,
    };

    request.post(authOptions, async (error, reponse, body) => {
      const { access_token, refresh_token } = body;

      await this.prisma.user.update({
        where: {
          id: user_id,
        },
        data: {
          access_spotify_token: access_token,
          refresh_spotify_token: refresh_token,
        },
      });
    });
  }
}
