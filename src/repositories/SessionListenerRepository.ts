import { PrismaClient, SessionListener, User } from '@prisma/client';
import { DEFAULT_USER_OBJECT } from 'constants/global';
import {
  FormatedSessionListener,
  formatSessionListener,
  formatSessionListeners,
} from 'utils/formatSession';
import { SessionResponse } from './SessionRepository';

export interface SessionListenerResponse extends SessionListener {
  session: Omit<SessionResponse, 'sessionListeners'> | null;
  user: User | null;
}
interface ISessionListenerRepository {
  create: (session_id: number, user_id: number) => Promise<SessionListener>;
  getUserListenerSessions: () => Promise<(FormatedSessionListener | null)[]>;
  getActiveListenerSessions: () => Promise<(FormatedSessionListener | null)[]>;
  getActiveUserListenerSession: (
    user_id: number,
  ) => Promise<FormatedSessionListener | null>;
}

export class SessionListenerRepository implements ISessionListenerRepository {
  constructor(private prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getActiveUserListenerSession(user_id: number) {
    const userSession = await this.prisma.sessionListener.findFirst({
      where: {
        user_id,
        session: {
          active: true,
        },
      },
      include: {
        session: {
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

    return formatSessionListener(userSession);
  }

  async create(session_id: number, user_id: number) {
    const isSectionActive = await this.prisma.session.findFirst({
      where: { id: session_id, active: true },
    });

    if (!isSectionActive) throw new Error(`Section is not active anymore`);

    const userHasActiveSession = await this.prisma.session.findFirst({
      where: { user_id, active: true },
    });

    if (userHasActiveSession) {
      await this.prisma.session.update({
        where: {
          id: userHasActiveSession.id,
        },
        data: {
          active: false,
        },
      });
    }

    const sessionListenerExists =
      !userHasActiveSession &&
      (await this.prisma.sessionListener.findFirst({
        where: { session_id, user_id },
      }));

    if (sessionListenerExists) throw new Error(`User already on this section`);

    const createdSessionListener = await this.prisma.sessionListener.create({
      data: {
        user_id,
        session_id,
      },
    });

    return createdSessionListener;
  }

  async getUserListenerSessions(userId?: number) {
    const userSession = await this.prisma.sessionListener.findMany({
      where: { user_id: userId },
      include: {
        session: {
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

    return formatSessionListeners(userSession);
  }

  async getActiveListenerSessions() {
    const userSession = await this.prisma.sessionListener.findMany({
      where: {
        session: {
          active: true,
        },
      },
      include: {
        session: {
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

    return formatSessionListeners(userSession);
  }
}
