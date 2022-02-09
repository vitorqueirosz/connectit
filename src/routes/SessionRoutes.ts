import SessionController from 'controllers/SessionController';
import SessionListenerController from 'controllers/SessionListenerController';
import { Router } from 'express';
import { SESSION } from './constants';

export const sessionRouter = Router();

const { create, index, get } = SessionController;
const { create: createListener, get: getListeners } = SessionListenerController;

sessionRouter.post(SESSION.ROOT, create);
sessionRouter.get(SESSION.ROOT, index);
sessionRouter.get(SESSION.ALL, get);

sessionRouter.post(SESSION.LISTENER, createListener);
sessionRouter.get(SESSION.LISTENER, getListeners);
