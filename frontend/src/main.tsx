import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AppProvider } from "./context/AppContext.tsx";
import { SocketProvider } from "./context/SocketContext.tsx";
import ConnectionStatus from "./components/ConnectionStatus.tsx";

export const authService = import.meta.env.VITE_AUTH_SERVICE || "http://localhost:5000";
export const restaurantService = import.meta.env.VITE_RESTAURANT_SERVICE || "http://localhost:5001";
export const utilsService = import.meta.env.VITE_UTILS_SERVICE || "http://localhost:5002";
export const realtimeService = import.meta.env.VITE_REALTIME_SERVICE || "http://localhost:5004";
export const riderService = import.meta.env.VITE_RIDER_SERVICE || "http://localhost:5005";
export const adminService = import.meta.env.VITE_ADMIN_SERVICE || "http://localhost:5006";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <SocketProvider>
        <App />
        <ConnectionStatus />
      </SocketProvider>
    </AppProvider>
  </StrictMode>
);
