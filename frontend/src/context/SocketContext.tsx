import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppData } from "./AppContext";
import { realtimeService } from "../main";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { isAuth } = useAppData();

  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuth) {
      if (socketInstance) {
        socketInstance.disconnect();
        setSocketInstance(null);
        setIsConnected(false);
      }
      return;
    }

    if (socketInstance) return;

    const socket = io(realtimeService, {
      auth: {
        token: localStorage.getItem("token"),
      },
      transports: ["polling", "websocket"],
    });

    setSocketInstance(socket);

    socket.on("connect", () => {
      console.log("Socket Connected", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket Disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.log("Socket Error:", err.message);
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
      setSocketInstance(null);
      setIsConnected(false);
    };
  }, [isAuth]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
