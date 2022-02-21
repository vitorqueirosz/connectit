import AuthenticationController from 'controllers/AuthenticationController';
import UserController from 'controllers/UserController';
import { Router } from 'express';
import { USER } from './constants';

export const userRouter = Router();

const { create } = UserController;
const { auth, spotifyAuth, accessToken } = AuthenticationController;

userRouter.post(USER.ROOT, create);

userRouter.post(USER.LOGIN, auth);

userRouter.get(USER.SPOTIFY_AUTH, spotifyAuth);
userRouter.get('/access_token', accessToken);
