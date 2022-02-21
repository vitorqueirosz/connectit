import { PrismaClient, User } from '@prisma/client';
import { UserService, AuthenticationService } from 'services';
import { SetSpotifyTokens } from 'interfaces/User';
import qs from 'qs';
import axios from 'axios';
import { SPOTIFY_BASE_URL } from 'controllers/AuthenticationController';
import {
  SpotifyAccessTokenPayload,
  SpotifyTokenPayload,
} from 'interfaces/Spotify';

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

interface AccessSpotifyTokenPayload {
  code: string;
  redirect_uri: string;
  state: number;
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

  async accessSpotifyToken({
    code,
    redirect_uri,
    state,
  }: AccessSpotifyTokenPayload) {
    const payload = {
      code,
      redirect_uri,
      grant_type: 'authorization_code',
    };

    const { data } = await axios.post<SpotifyAccessTokenPayload>(
      `${SPOTIFY_BASE_URL}/api/token`,
      qs.stringify(payload),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
          ).toString('base64')}`,
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    await this.setSpotifyTokens({
      user_id: Number(state),
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
  }

  async refreshSpotifyToken(user_id: number) {
    const userService = new UserService(this.prisma);

    const user = await userService.findUserById(user_id);

    if (!user) throw new Error('User not found');

    const payload = {
      grant_type: 'refresh_token',
      refresh_token: user.refresh_spotify_token,
    };

    const { data } = await axios.post<SpotifyTokenPayload>(
      `${SPOTIFY_BASE_URL}/api/token`,
      qs.stringify(payload),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
          ).toString('base64')}`,
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    await this.prisma.user.update({
      where: {
        id: user_id,
      },
      data: {
        access_spotify_token: data.access_token,
      },
    });

    return data.access_token;
  }
}
