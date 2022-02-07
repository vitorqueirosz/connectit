import {
  Album,
  Artist,
  Music,
  PrismaClient,
  SessionMusic,
} from '@prisma/client';
import { ISessionMusic } from 'interfaces/Session';

interface ISessionMusicRepository {
  create: (session: ISessionMusic) => Promise<SessionMusic>;
}

let musicData: Music;
let albumData: Album;
let artistData: Artist;

export class SessionMusicRepository implements ISessionMusicRepository {
  constructor(private prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(sessionMusic: ISessionMusic) {
    const {
      musicId,
      albumId,
      artistId,
      session_id,
      albumImage,
      albumName,
      albumType,
      artistImage,
      artistName,
      duration,
      musicName,
    } = sessionMusic;

    const [music, album, artist] = await Promise.all([
      this.prisma.music.findFirst({ where: { id: musicId } }),
      this.prisma.album.findFirst({ where: { id: albumId } }),
      this.prisma.artist.findFirst({ where: { id: artistId } }),
    ]);

    const createdAlbum = async () => {
      const album = await this.prisma.album.create({
        data: {
          id: albumId,
          name: albumName,
          image: albumImage,
          type: albumType,
        },
      });

      return album;
    };

    const createdArtist = async () => {
      const artist = await this.prisma.artist.create({
        data: {
          id: artistId,
          name: artistName,
          image: artistImage,
        },
      });

      return artist;
    };

    albumData = album || (await createdAlbum());
    artistData = artist || (await createdArtist());

    const createdMusic = async () => {
      const music = await this.prisma.music.create({
        data: {
          id: musicId,
          name: musicName,
          duration,
          album_id: albumData.id,
          artist_id: artistData.id,
        },
      });

      return music;
    };

    musicData = music || (await createdMusic());

    const createdSessionMusic = await this.prisma.sessionMusic.create({
      data: {
        session_id,
        music_id: musicData.id,
      },
    });

    return createdSessionMusic;
  }
}
