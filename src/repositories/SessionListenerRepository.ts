import { PrismaClient, SessionListener } from '@prisma/client';

interface ISessionListenerRepository {
  create: (session_id: number) => Promise<SessionListener>;
}

export class SessionListenerRepository implements ISessionListenerRepository {
  constructor(private prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(session_id: number) {
    const isSectionActive = await this.prisma.session.findFirst({
      where: { id: session_id, active: true },
    });

    if (!isSectionActive) throw new Error(`Section is not active anymore`);

    const userHasActiveSession = await this.prisma.session.findFirst({
      where: { user_id: 2, active: true },
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
        where: { session_id, user_id: 2 },
      }));

    if (sessionListenerExists) throw new Error(`User already on this section`);

    const createdSessionListener = await this.prisma.sessionListener.create({
      data: {
        user_id: 2,
        session_id,
      },
    });

    return createdSessionListener;
  }
}
