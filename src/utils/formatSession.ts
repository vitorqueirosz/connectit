import { SessionListenerResponse } from 'repositories/SessionListenerRepository';
import {
  SessionMusicPayload,
  SessionResponse,
} from 'repositories/SessionRepository';

interface UserOnSession {
  id: number | undefined;
  name: string | undefined;
  avatar: string | null | undefined;
}

export interface FormatedSession {
  id: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  user_id: number | null;
  owner: UserOnSession;
  sessionMusic: {
    id: number;
    session_id: number | null;
    created_at: Date;
    music: {
      id: string | undefined;
      name: string | undefined;
      duration: number | undefined;
      created_at: Date | undefined;
      image: string | undefined;
      album: {
        id: string | undefined;
        name: string | undefined;
        type: string | undefined;
      };
      artist: {
        id: string | undefined;
        name: string | undefined;
        image: string | undefined;
      };
    };
  };
  sessionListeners: {
    id: number;
    user_id: number | null;
    name: string | undefined;
    avatar: string | null | undefined;
  }[];
}

export interface FormatedSessionListener {
  id: number;
  session_id: number | null;
  created_at: Date;
  user: UserOnSession;
  session: Omit<Partial<FormatedSession>, 'sessionListeners'>;
}

const sessionMusicDefaultObject = (sessionMusic: SessionMusicPayload) => ({
  id: sessionMusic.id,
  session_id: sessionMusic.session_id,
  progress_ms: sessionMusic.progress_ms,
  created_at: sessionMusic.created_at,
  music: {
    id: sessionMusic.music?.id,
    name: sessionMusic.music?.name,
    duration: sessionMusic.music?.duration,
    created_at: sessionMusic.music?.created_at,
    image: sessionMusic.music?.album?.image,
    album: {
      id: sessionMusic.music?.album?.id,
      name: sessionMusic.music?.album?.name,
      type: sessionMusic.music?.album?.type,
    },
    artist: {
      id: sessionMusic.music?.artist?.id,
      name: sessionMusic.music?.artist?.name,
      image: sessionMusic.music?.artist?.image,
    },
  },
});

export const formatSession = (
  session: SessionResponse | null,
): FormatedSession | null => {
  if (!session) return null;

  const [sessionMusic] = session.sessionMusics;

  const formattedSession = {
    id: session.id,
    active: session.active,
    created_at: session.created_at,
    updated_at: session.updated_at,
    user_id: session.user_id,
    owner: {
      id: session.user?.id,
      name: session.user?.name,
      avatar: session.user?.avatar,
    },
    sessionMusic: sessionMusicDefaultObject(sessionMusic),
    sessionListeners: session.sessionListeners.map((listener) => ({
      id: listener.id,
      user_id: listener.user_id,
      name: listener.user?.name,
      avatar: listener.user?.avatar,
    })),
  };

  return formattedSession;
};

export const formatSessions = (sessions: SessionResponse[]) =>
  sessions.map((session) => formatSession(session));

export const formatSessionListener = (
  sessionListener: SessionListenerResponse | null,
): FormatedSessionListener | null => {
  if (!sessionListener) return null;

  const [sessionMusic] = sessionListener.session?.sessionMusics || [];

  const formatedSessionListener = {
    id: sessionListener.id,
    session_id: sessionListener.session_id,
    created_at: sessionListener.created_at,
    user: {
      id: sessionListener.user?.id,
      name: sessionListener.user?.name,
      avatar: sessionListener.user?.avatar,
    },
    session: {
      id: sessionListener.session?.id,
      active: sessionListener.session?.active,
      created_at: sessionListener.session?.created_at,
      updated_at: sessionListener.session?.updated_at,
      user_id: sessionListener.session?.user_id,
      sessionMusic: sessionMusicDefaultObject(sessionMusic),
      owner: {
        id: sessionListener.session?.user?.id,
        name: sessionListener.session?.user?.name,
        avatar: sessionListener.session?.user?.avatar,
      },
    },
  };

  return formatedSessionListener;
};

export const formatSessionListeners = (
  sessionListeners: SessionListenerResponse[],
) => sessionListeners.map((listener) => formatSessionListener(listener));
