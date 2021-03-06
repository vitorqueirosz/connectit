import { Album, Artist, Music } from '@prisma/client';

export interface ISession {
  musicId: string;
  musicName: string;
  musicUri: string;
  artistId: string;
  artistName: string;
  artistImage: string;
  albumId: string;
  albumImage: string;
  albumName: string;
  albumType: string;
  duration: number;
  progressMs: number;
}

export interface UpdateProgressPayload {
  progress_ms: number;
  session_music_id: number;
}
export interface ISessionMusic extends ISession {
  session_id: number;
}

export interface MusicResponse extends Music {
  album: Album | null;
  artist: Artist | null;
}
