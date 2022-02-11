import { Request, Response } from 'express';
import { SessionListenerRepository } from 'repositories/SessionListenerRepository';
import { prismaClient } from 'services/prisma';

class SessionListenerController {
  async create(request: Request, response: Response) {
    const { session_id } = request.body;
    const user_id = request.user.id;

    const sessionListenerRepository = new SessionListenerRepository(
      prismaClient,
    );

    const sessionListener = await sessionListenerRepository.create({
      session_id,
      user_id,
    });

    return response.status(201).json({ sessionListener });
  }

  async getSessions(request: Request, response: Response) {
    const sessionListenerRepository = new SessionListenerRepository(
      prismaClient,
    );
    const user_id = request.user.id;

    const sessionListeners =
      await sessionListenerRepository.getUserListenerSessions(user_id);

    return response.json({ sessionListeners });
  }

  async getAllActive(request: Request, response: Response) {
    const sessionListenerRepository = new SessionListenerRepository(
      prismaClient,
    );

    const sessionListeners =
      await sessionListenerRepository.getActiveListenerSessions();

    return response.json({ sessionListeners });
  }

  async getUserSession(request: Request, response: Response) {
    const sessionListenerRepository = new SessionListenerRepository(
      prismaClient,
    );
    const user_id = request.user.id;

    const sessionListener =
      await sessionListenerRepository.getActiveUserListenerSession(user_id);

    return response.json({ sessionListener });
  }
}

export default new SessionListenerController();
