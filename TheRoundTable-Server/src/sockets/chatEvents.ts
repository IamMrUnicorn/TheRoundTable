import { Socket } from 'socket.io';

export default (socket: Socket) => {
    socket.on('chatMessage', (msg) => {
        console.log(`Message received: ${msg}`);
        // Broadcast the message to others
        socket.broadcast.emit('chatMessage', msg);
    });

    // Add more chat-related events here
};
