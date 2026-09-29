import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SEC!) as any;

      if (!decoded || !decoded.user) {
        return next(new Error("Unauthorized"));
      }

      socket.data.user = decoded.user;

      next();
    } catch (error) {
      console.log("❌ Socket auth failed: ", error);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user;

    if (!user) {
      socket.disconnect();
      return;
    }

    const userId = user._id;

    socket.join(`user:${userId}`);

    if (user.restaurantId) {
      socket.join(`restaurant:${user.restaurantId}`);
    }

    console.log(`User connected: ${userId}`);
    console.log("Socket room: ", [...socket.rooms]);

    socket.on("join", (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    socket.on("leave", (room: string) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room ${room}`);
    });

    socket.on("rider:location", (data: { orderId: string; latitude: number; longitude: number }) => {
      if (!data.orderId) return;
      // Relay rider location to the specific order room (which OrderPage joins as `user:${orderId}`)
      io.to(`user:${data.orderId}`).emit("rider:location", {
        latitude: data.latitude,
        longitude: data.longitude,
      });
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected:${userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};
