import { User } from '@prisma/client';
import { SessionResponse } from 'repositories/SessionRepository';
import { Server, Socket } from 'socket.io';

export interface IUser extends User {
  confirmPassword?: string;
}

export interface WatchUserSessionPayload {
  user_id: number;
}

export interface WatchCurrentPlayingTrackPayload {
  socket: Socket;
  io: Server;
  session: SessionResponse;
}

export interface WatchUserListenerPayload {
  user_id: number;
  session_id: number;
  progress_ms: number;
  music_uri: string;
}

export interface SetNewPlayTrackPayload {
  music_uri: string;
  progress_ms: number;
}

export interface SetSpotifyTokens {
  user_id: number;
  access_token: string;
  refresh_token: string;
}
