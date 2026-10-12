import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000");
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = (): Socket | null => useContext(SocketContext);
