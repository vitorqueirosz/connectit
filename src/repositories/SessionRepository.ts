import { PrismaClient, Session } from '@prisma/client';
import { ISession } from 'interfaces/Session';
import { SessionMusicRepository } from './SessionMusicRepository';

interface ISessionRepository {
  create: (session: ISession) => Promise<Session>;
}

export class SessionRepository implements ISessionRepository {
  constructor(private prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(session: ISession) {
    const hasSessionActive = await this.prisma.session.findFirst({
      where: { user_id: 2, active: true },
    });

    if (hasSessionActive) throw new Error(`User already has a active session`);

    const sessionMusicRepository = new SessionMusicRepository(this.prisma);

    const createdSession = await this.prisma.session.create({
      data: {
        user_id: 2,
        active: true,
      },
    });

    await sessionMusicRepository.create({
      ...session,
      session_id: createdSession.id,
    });

    return createdSession;
  }
}
