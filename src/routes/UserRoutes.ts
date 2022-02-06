import UserController from 'controllers/UserController';
import { Router } from 'express';
import { USER } from './constants';

export const userRouter = Router();

const { create } = UserController;

userRouter.post(USER.root, create);
