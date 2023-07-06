import { Server as IOServer } from 'socket.io';
import chatEvents from './chatEvents';

export const setupSocketIO = (io: IOServer) => {
    io.on('connection', (socket) => {
        console.log(`${socket.id} connected`);

        // Set up chat events
        chatEvents(socket);

        socket.emit('test', 'hello?');
    });
};
