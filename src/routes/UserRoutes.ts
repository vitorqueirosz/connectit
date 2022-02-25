import AuthenticationController from 'controllers/AuthenticationController';
import UserController from 'controllers/UserController';
import { Router } from 'express';
import { ensureAuthenticated } from 'middlewares/ensureAuthenticate';
import { USER } from './constants';

export const userRouter = Router();

const { create, get } = UserController;
const { auth, spotifyAuth, accessToken } = AuthenticationController;

userRouter.post(USER.ROOT, create);

userRouter.post(USER.LOGIN, auth);

userRouter.get(USER.SPOTIFY_AUTH, spotifyAuth);
userRouter.get('/access_token', accessToken);

userRouter.use(ensureAuthenticated);

userRouter.get(USER.ME, get);
