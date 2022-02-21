import { Request, Response } from 'express';
import qs from 'qs';
import { prismaClient } from 'services/prisma';
import { AuthenticationRepository } from 'repositories/AuthenticationRepository';

export const SPOTIFY_BASE_URL = 'https://accounts.spotify.com';

const scope = 'user-read-currently-playing user-modify-playback-state';
const redirect_uri = 'http://localhost:3333/users/access_token';

class AuthenticationController {
  async auth(request: Request, response: Response) {
    const { email, password } = request.body;

    const authenticationRepository = new AuthenticationRepository(prismaClient);

    const user = await authenticationRepository.authenticate({
      email,
      password,
    });

    return response.json({ user });
  }

  spotifyAuth(request: Request, response: Response) {
    const userid = request.params.id;

    return response.redirect(
      `${SPOTIFY_BASE_URL}/authorize?${qs.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope,
        state: userid,
        redirect_uri,
      })}`,
    );
  }

  async accessToken(request: Request, response: Response) {
    const authRepository = new AuthenticationRepository(prismaClient);
    const { code, state } = request.query;

    await authRepository.accessSpotifyToken({
      code: String(code),
      state: Number(state),
      redirect_uri,
    });

    return response.redirect('http://localhost:3000');
  }
}

export default new AuthenticationController();
