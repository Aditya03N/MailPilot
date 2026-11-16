let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    // Join team room for real-time team broadcasts
    socket.on('join_team', ({ teamId, userId, role }) => {
      if (teamId) {
        socket.join(`team_${teamId}`);
        socket.join(`user_${userId}`);
        console.log(`[Socket] User ${userId} (${role}) joined team_${teamId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return ioInstance;
};

export const getIO = () => {
  return ioInstance;
};

export const emitToTeam = (teamId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`team_${teamId}`).emit(event, data);
  }
};

export const emitToUser = (userId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit(event, data);
  }
};

