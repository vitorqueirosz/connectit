import { Router } from 'express';
import { SESSION, USER } from './constants';
import { sessionRouter } from './SessionRoutes';
import { userRouter } from './UserRoutes';

export const routes = Router();

routes.use(USER.base, userRouter);
routes.use(SESSION.base, sessionRouter);
