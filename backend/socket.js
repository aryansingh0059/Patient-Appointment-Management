const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');

let io;
const connectedUsers = new Map(); // userId -> { role, sockets: Set }

const init = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Allow all origins for compatibility, can be locked down if needed
            methods: ["GET", "POST", "PUT", "DELETE"]
        }
    });

    // JWT Authentication middleware for Socket.IO
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.query?.token;
            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            // Attach user info to socket
            socket.user = user;
            next();
        } catch (error) {
            console.error('Socket authentication failed:', error.message);
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        const role = socket.user.role; // 'patient' or 'doctor'

        console.log(`User connected: ${userId} (${role}) via socket: ${socket.id}`);

        // Register the new socket connection
        if (!connectedUsers.has(userId)) {
            connectedUsers.set(userId, { role, sockets: new Set() });
        }
        connectedUsers.get(userId).sockets.add(socket.id);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId} via socket: ${socket.id}`);
            const userConn = connectedUsers.get(userId);
            if (userConn) {
                userConn.sockets.delete(socket.id);
                if (userConn.sockets.size === 0) {
                    connectedUsers.delete(userId);
                }
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io is not initialized!');
    }
    return io;
};

// Send event to specific user (across all their connected sockets/tabs)
const sendToUser = (userId, event, data) => {
    if (!io) return;
    const userConn = connectedUsers.get(userId.toString());
    if (userConn) {
        userConn.sockets.forEach(socketId => {
            io.to(socketId).emit(event, data);
        });
    }
};

// Send event to all users with a specific role
const sendToRole = (role, event, data) => {
    if (!io) return;
    for (const [userId, userConn] of connectedUsers.entries()) {
        if (userConn.role === role) {
            userConn.sockets.forEach(socketId => {
                io.to(socketId).emit(event, data);
            });
        }
    }
};

module.exports = { init, getIO, sendToUser, sendToRole };
