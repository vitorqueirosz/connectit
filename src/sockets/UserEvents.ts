import { START_USER_SESSION } from 'constants/events';
import { ISession } from 'interfaces/Session';
import { TrackPayload } from 'interfaces/Spotify';
import {
  WatchCurrentPlayingTrackPayload,
  WatchUserSessionPayload,
} from 'interfaces/User';
import { SessionMusicRepository } from 'repositories/SessionMusicRepository';
import { SessionRepository } from 'repositories/SessionRepository';
import { api, prismaClient } from 'services';
import { Server, Socket } from 'socket.io';
import { setTimeOut } from 'utils/asyncTimeOut';

const USER_SESSION = 'user_session';
const STOP_SESSION = 'stop_session';
const GET_CURRENTLY_PLAYING_TRACK = '/me/player/currently-playing';

const fetchCurrentPlayingTrack = async (spotify_token: string) => {
  const { data } = await api.get<TrackPayload>(GET_CURRENTLY_PLAYING_TRACK, {
    headers: {
      Authorization: `Bearer ${spotify_token}`,
    },
  });

  return data;
};

const seriealizeTrackFromSpotify = (trackPayload: TrackPayload) => {
  const { item } = trackPayload;

  const data: ISession = {
    musicId: item.id,
    musicName: item.name,
    artistId: item.artists[0].id,
    artistName: item.artists[0].name,
    artistImage: item.artists[0].href,
    albumId: item.album.id,
    albumImage: item.album.images[0].url,
    albumName: item.album.name,
    albumType: item.album.type,
    duration: item.duration_ms,
  };

  return data;
};

let keepRunning: boolean;

const watchCurrentPlayingTrack = ({
  socket,
  session,
  spotify_token,
}: WatchCurrentPlayingTrackPayload) => {
  const sessionMusicRepository = new SessionMusicRepository(prismaClient);
  keepRunning = true;

  const interval = setInterval(async () => {
    const [currentSessionMusic] = session.sessionMusics;

    if (!keepRunning) return;

    const currentTrack = await fetchCurrentPlayingTrack(spotify_token);

    const hasMusicChanged =
      currentTrack.item.id !== currentSessionMusic.music?.id;
    const isMusicStillPlaying = currentTrack.is_playing;

    // console.log({ old: session.sessionMusics[0].music?.name });

    if (!isMusicStillPlaying) {
      socket.emit(STOP_SESSION);
      clearInterval(interval);
    }

    if (hasMusicChanged && isMusicStillPlaying) {
      const formatedTrack = seriealizeTrackFromSpotify(currentTrack);

      keepRunning = false;
      await setTimeOut(3000);

      const sessionMusic = await sessionMusicRepository.create({
        ...formatedTrack,
        session_id: session.id,
      });

      session.sessionMusics = [sessionMusic];
      keepRunning = true;

      // console.log({ new: session.sessionMusics[0].music?.name });

      socket.emit(USER_SESSION, session);
    }
  }, 1000);
};

export const registerUserEvents = async (io: Server, socket: Socket) => {
  const watchUserSession = async (data: WatchUserSessionPayload) => {
    const userSession = await fetchCurrentPlayingTrack(data.spotify_token);
    const formatedTrack = seriealizeTrackFromSpotify(userSession);

    const sessionRepository = new SessionRepository(prismaClient);

    const session = await sessionRepository.create({
      session: formatedTrack,
      user_id: data.user_id,
    });

    watchCurrentPlayingTrack({
      session,
      socket,
      spotify_token: data.spotify_token,
    });
  };

  socket.on(START_USER_SESSION, watchUserSession);
};
