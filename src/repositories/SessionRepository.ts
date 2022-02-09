import {
  PrismaClient,
  Session,
  SessionListener,
  SessionMusic,
  User,
} from '@prisma/client';
import { ISession } from 'interfaces/Session';
import { SessionMusicRepository } from './SessionMusicRepository';

interface UserSessionResponse extends Session {
  sessionMusics: SessionMusic[];
  sessionListeners: SessionListener[];
  user: User | null;
}
interface ISessionRepository {
  create: (session: ISession) => Promise<Session>;
  getUserSession: (userId?: number) => Promise<UserSessionResponse | null>;
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

  async getUserSession(userId?: number) {
    const userSession = await this.prisma.session.findFirst({
      where: { user_id: userId, active: true },
      include: {
        sessionMusics: true,
        sessionListeners: true,
        user: true,
      },
    });

    return userSession;
  }
}
