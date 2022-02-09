import { Request, Response } from 'express';
import { ISession } from 'interfaces/Session';
import { SessionRepository } from 'repositories/SessionRepository';
import { prismaClient } from 'services/prisma';

class SessionController {
  async create(request: Request, response: Response) {
    const sessionData: ISession = request.body;

    const sessionRepository = new SessionRepository(prismaClient);

    const session = await sessionRepository.create({
      ...sessionData,
    });

    return response.status(201).json({ session });
  }

  async index(request: Request, response: Response) {
    const sessionRepository = new SessionRepository(prismaClient);

    const session = await sessionRepository.getUserSession(2);

    return response.json({ session });
  }

  async get(request: Request, response: Response) {
    const sessionRepository = new SessionRepository(prismaClient);

    const sessions = await sessionRepository.getAllActiveSessions();

    return response.json({ sessions });
  }
}

export default new SessionController();
