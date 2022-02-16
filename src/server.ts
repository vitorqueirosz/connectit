import express from 'express';
import { routes } from 'routes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { SocketConnection } from 'sockets';

const PORT = 3333;

const app = express();
const server = createServer(app);

const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(routes);

SocketConnection(io);

// eslint-disable-next-line no-console
io.listen(app.listen(PORT, () => console.log(`Running at port ${PORT}!`)));
