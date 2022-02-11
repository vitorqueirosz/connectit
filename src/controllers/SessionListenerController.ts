import { Request, Response } from 'express';
import { SessionListenerRepository } from 'repositories/SessionListenerRepository';
import { prismaClient } from 'services/prisma';

class SessionListenerController {
  async create(request: Request, response: Response) {
    const { session_id } = request.body;

    const sessionListenerRepository = new SessionListenerRepository(
      prismaClient,
    );

    const sessionListener = await sessionListenerRepository.create(
      session_id,
      4,
    );

    return response.status(201).json({ sessionListener });
  }

  async getSessions(request: Request, response: Response) {
    const sessionListenerRepository = new SessionListenerRepository(
      prismaClient,
    );

    const sessionListeners =
      await sessionListenerRepository.getUserListenerSessions(3);

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

    const sessionListener =
      await sessionListenerRepository.getActiveUserListenerSession(3);

    return response.json({ sessionListener });
  }
}

export default new SessionListenerController();
