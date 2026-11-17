import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const rawApiUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
      : "";

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      rawApiUrl ||
      (typeof window !== "undefined" && window.location.port === "3000"
        ? "http://localhost:5000"
        : window.location.origin);

    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
};

export const joinTeamRoom = (teamId, userId, role) => {
  const s = getSocket();
  if (s && teamId) {
    s.emit('join_team', { teamId, userId, role });
  }
};
