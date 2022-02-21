import { Request, Response } from 'express';
import qs from 'qs';
import requester from 'request';
import { prismaClient } from 'services/prisma';
import { AuthenticationRepository } from 'repositories/AuthenticationRepository';

const SPOTIFY_BASE_URL = 'https://accounts.spotify.com';

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

  accessToken(request: Request, response: Response) {
    const authRepository = new AuthenticationRepository(prismaClient);
    const { code, state } = request.query;

    const authOptions = {
      url: `${SPOTIFY_BASE_URL}/api/token`,
      form: {
        code,
        redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
        ).toString('base64')}`,
      },
      json: true,
    };

    return requester.post(authOptions, async (error, reponse, body) => {
      const { access_token, refresh_token } = body;

      await authRepository.setSpotifyTokens({
        user_id: Number(state),
        access_token,
        refresh_token,
      });

      return response.redirect('http://localhost:3000');
    });
  }
}

export default new AuthenticationController();
