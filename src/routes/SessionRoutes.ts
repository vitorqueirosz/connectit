import SessionController from 'controllers/SessionController';
import SessionListenerController from 'controllers/SessionListenerController';
import { Router } from 'express';
import { SESSION } from './constants';

export const sessionRouter = Router();

const { create, index, get } = SessionController;
const {
  create: createListener,
  index: getUserListenerSessions,
  get: getActiveListenerSessions,
} = SessionListenerController;

sessionRouter.post(SESSION.ROOT, create);
sessionRouter.get(SESSION.ROOT, index);
sessionRouter.get(SESSION.ALL, get);

sessionRouter.post(SESSION.LISTENER, createListener);
sessionRouter.get(SESSION.USER_LISTENERS, getUserListenerSessions);
sessionRouter.get(SESSION.ACTIVE_LISTENERS, getActiveListenerSessions);
