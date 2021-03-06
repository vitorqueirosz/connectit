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
import { UserRepository } from './UserRepository';

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

interface SessionPayload {
  session: ISession;
  user_id: number;
}

interface ISessionRepository {
  create: (sessionPayload: SessionPayload) => Promise<Session>;
  getUserActiveSession: (userId: number) => Promise<FormatedSession | null>;
  getAllActiveSessions: () => Promise<(FormatedSession | null)[]>;
  inativeUserSession: (session_id: number) => Promise<{
    user: User | null;
    sessionListeners: SessionListener[];
  }>;
}

export class SessionRepository implements ISessionRepository {
  constructor(private prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create({ session, user_id }: SessionPayload) {
    const hasSessionActive = await this.prisma.session.findFirst({
      where: { user_id, active: true },
    });

    if (hasSessionActive) throw new Error(`User already has a active session`);

    const sessionMusicRepository = new SessionMusicRepository(this.prisma);
    const userRepository = new UserRepository(this.prisma);

    const createdSession = await this.prisma.session.create({
      data: {
        user_id,
        active: true,
      },
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

    await userRepository.setUserStatus(user_id, 'owner');

    const sessionMusic = await sessionMusicRepository.create({
      ...session,
      session_id: createdSession.id,
    });

    const sessionWithSessionMusic = {
      ...createdSession,
      sessionMusics: [sessionMusic],
    };

    return sessionWithSessionMusic;
  }

  async getUserActiveSession(user_id: number) {
    const userSession = await this.prisma.session.findFirst({
      where: { user_id, active: true },
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

  async inativeUserSession(session_id: number) {
    const activeSession = await this.prisma.session.update({
      where: {
        id: session_id,
      },
      data: {
        active: false,
      },
      select: {
        user: true,
        sessionListeners: true,
      },
    });

    const userRepository = new UserRepository(this.prisma);

    await Promise.all([
      userRepository.setUserStatus(activeSession.user!.id, null),
      ...activeSession.sessionListeners.map((listener) => {
        return userRepository.setUserStatus(Number(listener.user_id), null);
      }),
    ]);

    return activeSession;
  }
}
