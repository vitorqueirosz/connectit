import { Server } from 'socket.io';
import { registerUserEvents } from './UserEvents';

export const SocketConnection = (io: Server) => {
  io.on('connection', (socket) => {
    // console.log({ socketId: socket.id });

    registerUserEvents(io, socket);
  });
};
