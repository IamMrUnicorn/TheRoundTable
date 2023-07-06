import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { Clerk } from '@clerk/clerk-sdk-node';
import { logger } from './utils/logger';
import characterRoutes from './routes/character';
import { setupSocketIO } from './sockets';

dotenv.config();

const clerk = new Clerk({
    apiKey: process.env.CLERK_API_KEY!,
});

const app = express();
const server = new HttpServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });
setupSocketIO(io);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Routes
app.use(characterRoutes);

server.listen(3000, () => {
    console.log(`Server is running on`, server.address());
});
