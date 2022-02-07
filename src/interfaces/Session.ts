export interface ISession {
  musicId: string;
  musicName: string;
  artistId: string;
  artistName: string;
  artistImage: string;
  albumId: string;
  albumImage: string;
  albumName: string;
  albumType: string;
  duration: number;
}

export interface ISessionMusic extends ISession {
  session_id: number;
}