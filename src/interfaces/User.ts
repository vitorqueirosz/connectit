import { User } from '@prisma/client';
import { SessionResponse } from 'repositories/SessionRepository';
import { Socket } from 'socket.io';

export interface IUser extends User {
  confirmPassword?: string;
}

export interface WatchUserSessionPayload {
  user_id: number;
  spotify_token: string;
}

export interface WatchCurrentPlayingTrackPayload {
  socket: Socket;
  session: SessionResponse;
  spotify_token: string;
}
