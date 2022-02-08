import { Request, Response } from 'express';
import { SessionListenerRepository } from 'repositories/SessionListenerRepository';
import { prismaClient } from 'services/prisma';

class SessionListenerController {
  async create(request: Request, response: Response) {
    const { session_id } = request.body;

    const sessionListenerRepository = new SessionListenerRepository(
      prismaClient,
    );

    const sessionListener = await sessionListenerRepository.create(session_id);

    return response.status(201).json({ sessionListener });
  }
}

export default new SessionListenerController();
