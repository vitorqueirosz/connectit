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
  getUserActiveSession: (
    userId?: number,
  ) => Promise<UserSessionResponse | null>;
  getAllActiveSessions: () => Promise<Session[]>;
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

  async getUserActiveSession(userId?: number) {
    const userSession = await this.prisma.session.findFirst({
      where: { user_id: userId, active: true },
      include: {
        sessionMusics: {
          include: {
            music: {
              include: {
                album: true,
                artist: true,
              },
            },
          },
        },
        sessionListeners: {
          include: {
            user: true,
          },
        },
        user: true,
      },
    });

    return userSession;
  }

  async getAllActiveSessions() {
    const sessions = await this.prisma.session.findMany({
      where: { active: true },
      include: {
        sessionMusics: {
          include: {
            music: {
              include: {
                album: true,
                artist: true,
              },
            },
          },
        },
        sessionListeners: {
          include: {
            user: true,
          },
        },
        user: true,
      },
    });

    return sessions;
  }
}
