import { Router } from 'express';
import { SESSION, USER } from './constants';
import { sessionRouter } from './SessionRoutes';
import { userRouter } from './UserRoutes';

export const routes = Router();

routes.use(USER.BASE, userRouter);
routes.use(SESSION.BASE, sessionRouter);
