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
}

export default new SessionController();
