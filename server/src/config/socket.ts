import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server | null = null;

export const initSocket = (httpServer: HttpServer, origins: string[]): Server => {
  io = new Server(httpServer, { cors: { origin: origins, methods: ["GET", "POST"] } });
  io.on("connection", (socket) => {
    console.log(`[socket] connected ${socket.id}`);
    socket.on("disconnect", () => console.log(`[socket] disconnected ${socket.id}`));
  });
  return io;
};

// Safe to call before the socket server exists: it simply does nothing.
export const emitEvent = (event: string, payload: unknown): void => {
  io?.emit(event, payload);
};
