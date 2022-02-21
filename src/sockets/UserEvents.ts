import axios from 'axios';
import { START_USER_SESSION } from 'constants/events';
import { ISession } from 'interfaces/Session';
import { TrackPayload } from 'interfaces/Spotify';
import {
  SetNewPlayTrackPayload,
  WatchCurrentPlayingTrackPayload,
  WatchUserListenerPayload,
  WatchUserSessionPayload,
} from 'interfaces/User';
import { AuthenticationRepository } from 'repositories/AuthenticationRepository';
import { SessionMusicRepository } from 'repositories/SessionMusicRepository';
import { SessionRepository } from 'repositories/SessionRepository';
import { spotifyApi, prismaClient } from 'services';
import { Server, Socket } from 'socket.io';
import { setTimeOut } from 'utils/asyncTimeOut';

const SESSION_CHANGED = 'session_changed';
const MUSIC_CHANGED = 'music_changed';
const SESSION_FINISHED = 'session_finished';
const USER_LISTENER = 'user_listener';

const GET_CURRENTLY_PLAYING_TRACK = '/me/player/currently-playing';
const SET_NEW_PLAY_TRACK = '/me/player/currently-playing';

const setInterceptors = async (
  spotify_access_token: string,
  user_id: number,
) => {
  const authRepository = new AuthenticationRepository(prismaClient);

  spotifyApi.interceptors.request.use((config) => {
    config.headers!.Authorization = `Bearer test`;

    return config;
  });

  spotifyApi.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response.status === 401 && !originalRequest._retry) {
        await authRepository.refreshSpotifyToken(user_id);
        const spotify_access_token = await authRepository.getSpotifyAcessToken(
          user_id,
        );

        originalRequest._retry = true;
        originalRequest.headers.Authorization = `Bearer ${spotify_access_token}`;

        return axios(originalRequest);
      }
      return Promise.reject(error);
    },
  );
};

const fetchCurrentPlayingTrack = async () => {
  const { data } = await spotifyApi.get<TrackPayload>(
    GET_CURRENTLY_PLAYING_TRACK,
  );

  return data;
};

const seriealizeTrackFromSpotify = (trackPayload: TrackPayload) => {
  const { item, progress_ms } = trackPayload;

  const data: ISession = {
    musicId: item.id,
    musicName: item.name,
    musicUri: item.uri,
    artistId: item.artists[0].id,
    artistName: item.artists[0].name,
    artistImage: item.artists[0].href,
    albumId: item.album.id,
    albumImage: item.album.images[0].url,
    albumName: item.album.name,
    albumType: item.album.type,
    duration: item.duration_ms,
    progressMs: progress_ms,
  };

  return data;
};

const watchCurrentPlayingTrack = ({
  socket,
  io,
  session,
}: WatchCurrentPlayingTrackPayload) => {
  const sessionMusicRepository = new SessionMusicRepository(prismaClient);
  const sessionRepository = new SessionRepository(prismaClient);

  const updateSessionMusicProgress = (
    session_music_id: number,
    progress_ms: number,
  ) => {
    return sessionMusicRepository.updateProgress({
      session_music_id,
      progress_ms,
    });
  };

  const emitSessionChangeToAll = () => io.emit(SESSION_CHANGED, session.id);

  let keepRunning = true;
  let progress_ms = 0;

  const interval = setInterval(async () => {
    const [currentSessionMusic] = session.sessionMusics;

    if (!keepRunning) return;

    const currentTrack = await fetchCurrentPlayingTrack();

    const hasMusicChanged =
      currentTrack.item.id !== currentSessionMusic.music?.id;
    const isMusicStillPlaying = currentTrack.is_playing;

    if (!hasMusicChanged) progress_ms = currentTrack.progress_ms;

    // console.log({ old: session.sessionMusics[0].music?.name });

    if (!isMusicStillPlaying) {
      await Promise.all([
        sessionRepository.inativeUserSession(session.id),
        updateSessionMusicProgress(currentSessionMusic.id, progress_ms),
      ]);

      emitSessionChangeToAll();
      socket.to(String(session.id)).emit(SESSION_FINISHED, 'stop');
      clearInterval(interval);
    }

    if (hasMusicChanged && isMusicStillPlaying) {
      const formatedTrack = seriealizeTrackFromSpotify(currentTrack);

      await updateSessionMusicProgress(currentSessionMusic.id, progress_ms);

      keepRunning = false;
      await setTimeOut(3000);

      const sessionMusic = await sessionMusicRepository.create({
        ...formatedTrack,
        session_id: session.id,
      });

      session.sessionMusics = [sessionMusic];
      keepRunning = true;

      // console.log({ new: session.sessionMusics[0].music?.name });

      const listenerPayload = {
        music_uri: currentSessionMusic.music?.uri,
        progress_ms: currentSessionMusic.progress_ms,
      };

      emitSessionChangeToAll();
      socket.to(String(session.id)).emit(MUSIC_CHANGED, listenerPayload);
    }
  }, 1000);
};

const setNewPlayTrack = async ({
  music_uri,
  progress_ms,
}: SetNewPlayTrackPayload) => {
  const payload = { uris: [music_uri], position_ms: progress_ms };
  return spotifyApi.put(SET_NEW_PLAY_TRACK, payload);
};

export const registerUserEvents = async (io: Server, socket: Socket) => {
  const authRepository = new AuthenticationRepository(prismaClient);

  const watchUserSession = async (data: WatchUserSessionPayload) => {
    const spotify_token = await authRepository.getSpotifyAcessToken(
      data.user_id,
    );

    if (!spotify_token) return;

    setInterceptors(spotify_token, data.user_id);

    const userSession = await fetchCurrentPlayingTrack();

    if (!userSession) return;

    const formatedTrack = seriealizeTrackFromSpotify(userSession);

    const sessionRepository = new SessionRepository(prismaClient);

    const session = await sessionRepository.create({
      session: formatedTrack,
      user_id: data.user_id,
    });

    watchCurrentPlayingTrack({
      session,
      io,
      socket,
    });
  };

  const watchUserListener = async (data: WatchUserListenerPayload) => {
    const spotify_token = await authRepository.getSpotifyAcessToken(
      data.user_id,
    );

    if (!spotify_token) return;

    setInterceptors(spotify_token, data.user_id);

    await setNewPlayTrack({
      music_uri: data.music_uri,
      progress_ms: data.progress_ms,
    });

    socket.join(String(data.session_id));
  };

  socket.on(START_USER_SESSION, watchUserSession);

  socket.on(USER_LISTENER, watchUserListener);
};
