import { User } from '@prisma/client';
import { SessionResponse } from 'repositories/SessionRepository';
import { Server, Socket } from 'socket.io';

export interface IUser extends User {
  confirmPassword?: string;
}

export interface WatchUserSessionPayload {
  user_id: number;
  spotify_token: string;
}

export interface WatchCurrentPlayingTrackPayload {
  socket: Socket;
  io: Server;
  session: SessionResponse;
  spotify_token: string;
}

export interface WatchUserListenerPayload {
  user_id: number;
  session_id: number;
  spotify_token: string;
  music_uri: string;
}
