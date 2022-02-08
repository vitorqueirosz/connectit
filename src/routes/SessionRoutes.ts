import SessionController from 'controllers/SessionController';
import { Router } from 'express';
import { SESSION } from './constants';

export const sessionRouter = Router();

const { create } = SessionController;

sessionRouter.post(SESSION.root, create);
