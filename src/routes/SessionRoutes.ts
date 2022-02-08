import SessionController from 'controllers/SessionController';
import SessionListenerController from 'controllers/SessionListenerController';
import { Router } from 'express';
import { SESSION } from './constants';

export const sessionRouter = Router();

const { create } = SessionController;
const { create: createListener } = SessionListenerController;

sessionRouter.post(SESSION.ROOT, create);
sessionRouter.post(SESSION.LISTENER, createListener);
