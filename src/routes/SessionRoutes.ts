import SessionController from 'controllers/SessionController';
import SessionListenerController from 'controllers/SessionListenerController';
import { Router } from 'express';
import { ensureAuthenticated } from 'middlewares/ensureAuthenticate';
import { SESSION } from './constants';

export const sessionRouter = Router();

const { create, index, get, getAllUserSessions } = SessionController;
const {
  create: createListener,
  getSessions,
  getAllActive,
  getUserSession,
} = SessionListenerController;

sessionRouter.get(SESSION.ALL, get);
sessionRouter.get(SESSION.ACTIVE_LISTENERS, getAllActive);

sessionRouter.use(ensureAuthenticated);

sessionRouter.post(SESSION.ROOT, create);
sessionRouter.get(SESSION.ROOT, index);
sessionRouter.get(SESSION.USER_SESSIONS, getAllUserSessions);

sessionRouter.post(SESSION.LISTENER, createListener);
sessionRouter.get(SESSION.USER_LISTENERS, getSessions);
sessionRouter.get(SESSION.ACTIVE_USER_LISTENER, getUserSession);
