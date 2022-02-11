import {
  PrismaClient,
  Session,
  SessionListener,
  SessionMusic,
  User,
} from '@prisma/client';
import { DEFAULT_USER_OBJECT } from 'constants/global';
import { ISession, MusicResponse } from 'interfaces/Session';
import {
  FormatedSession,
  formatSession,
  formatSessions,
} from 'utils/formatSession';
import { SessionMusicRepository } from './SessionMusicRepository';

export interface SessionMusicPayload extends SessionMusic {
  music: MusicResponse | null;
}
export interface SessionResponse extends Session {
  sessionMusics: SessionMusicPayload[];
  sessionListeners: (SessionListener & {
    user: User | null;
  })[];
  user: User | null;
}

interface ISessionRepository {
  create: (session: ISession) => Promise<Session>;
  getUserActiveSession: (userId?: number) => Promise<FormatedSession | null>;
  getAllActiveSessions: () => Promise<(FormatedSession | null)[]>;
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
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
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
            user: {
              select: {
                ...DEFAULT_USER_OBJECT,
              },
            },
          },
        },
        user: {
          select: {
            ...DEFAULT_USER_OBJECT,
          },
        },
      },
    });

    return formatSession(userSession);
  }

  async getAllActiveSessions() {
    const sessions = await this.prisma.session.findMany({
      where: { active: true },
      include: {
        sessionMusics: {
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
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
            user: {
              select: {
                ...DEFAULT_USER_OBJECT,
              },
            },
          },
        },
        user: {
          select: {
            ...DEFAULT_USER_OBJECT,
          },
        },
      },
    });

    return formatSessions(sessions);
  }

  async getAllUserSessions(user_id: number) {
    const sessions = await this.prisma.session.findMany({
      where: { user_id },
      include: {
        sessionMusics: {
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
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
            user: {
              select: {
                ...DEFAULT_USER_OBJECT,
              },
            },
          },
        },
        user: {
          select: {
            ...DEFAULT_USER_OBJECT,
          },
        },
      },
    });

    return formatSessions(sessions);
  }
}
