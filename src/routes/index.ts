import { Router } from 'express';
import { USER } from './constants';
import { userRouter } from './UserRoutes';

export const routes = Router();

routes.use(USER.base, userRouter);
