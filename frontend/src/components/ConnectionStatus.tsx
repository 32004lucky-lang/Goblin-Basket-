import { useSocket } from "../context/SocketContext";

const ConnectionStatus = () => {
  const { isConnected } = useSocket();

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white shadow-lg transition-all duration-300 z-50 ${
        isConnected ? "bg-[#2E6327]" : "bg-[#D95D24]"
      }`}
    >
      <div
        className={`h-2 w-2 rounded-full ${
          isConnected ? "bg-white animate-pulse" : "bg-white"
        }`}
      />
      {isConnected ? "Connected" : "Disconnected"}
    </div>
  );
};

export default ConnectionStatus;
