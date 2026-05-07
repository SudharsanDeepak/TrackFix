const { Server } = require('socket.io');
const logger = require('../utils/logger');
const { eventBus, EVENTS, EVENT_ROLE_MAP } = require('../utils/eventBus');

// Store active connections by user and role
const activeConnections = {
  byUserId: {},      // userId -> [socketIds]
  byRole: {},        // role -> [socketIds]
  byZone: {},        // zoneCode -> [socketIds]
  byDepot: {},       // depotId -> [socketIds]
  sockets: {},       // socketId -> {userId, role, zoneCode, depotId}
};

let io;

/**
 * Initialize Socket.IO with HTTP server
 */
const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // Middleware: Authenticate socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const userId = socket.handshake.auth.userId;
    const role = socket.handshake.auth.role;
    const zoneCode = socket.handshake.auth.zoneCode;
    const depotId = socket.handshake.auth.depotId;

    if (!userId || !role) {
      return next(new Error('Authentication error: Missing user info'));
    }

    // Attach user info to socket
    socket.userId = userId;
    socket.role = role;
    socket.zoneCode = zoneCode;
    socket.depotId = depotId;

    logger.info('Socket authenticated:', { userId, role, socketId: socket.id });
    next();
  });

  // Connection handler
  io.on('connection', (socket) => {
    const { userId, role, zoneCode, depotId } = socket;

    logger.info('Client connected:', {
      socketId: socket.id,
      userId,
      role,
      zoneCode,
      depotId,
    });

    // Register connection in tracking
    trackConnection(socket.id, { userId, role, zoneCode, depotId });

    // Join role-based room
    socket.join(`role:${role}`);
    
    // Join zone-based room (if applicable)
    if (zoneCode) {
      socket.join(`zone:${zoneCode}`);
    }
    
    // Join depot-based room (if applicable)
    if (depotId) {
      socket.join(`depot:${depotId}`);
    }
    
    // Join user-specific room
    socket.join(`user:${userId}`);

    // Send welcome message with current connection info
    socket.emit('connect:success', {
      socketId: socket.id,
      userId,
      role,
      rooms: socket.rooms,
    });

    // Listen for client events
    socket.on('disconnect', () => {
      untrackConnection(socket.id);
      logger.info('Client disconnected:', { socketId: socket.id, userId });
    });

    socket.on('error', (error) => {
      logger.error('Socket error:', { socketId: socket.id, userId, error });
    });

    // Ping/Pong for keep-alive
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  // Listen to backend events and broadcast to clients
  setupEventListeners(io);

  logger.info('Socket.IO initialized');
  return io;
};

/**
 * Setup event listeners to broadcast to connected clients
 */
const setupEventListeners = (io) => {
  // Listen to role-based events
  eventBus.onRoleEvent((data) => {
    const { event, targetRoles, zoneCode, depotId, ...eventData } = data;

    // Broadcast to applicable role-based rooms
    if (Array.isArray(targetRoles) && targetRoles.length > 0) {
      targetRoles.forEach((role) => {
        const room = `role:${role}`;
        io.to(room).emit(event, eventData);
        logger.debug('Event broadcasted to role:', { event, role });
      });
    }

    // Also broadcast to zone/depot if applicable
    if (zoneCode) {
      io.to(`zone:${zoneCode}`).emit(event, { ...eventData, zoneCode });
    }
    if (depotId) {
      io.to(`depot:${depotId}`).emit(event, { ...eventData, depotId });
    }
  });

  // Listen to individual events and broadcast to appropriate roles
  Object.values(EVENTS).forEach((eventName) => {
    eventBus.onEvent(eventName, (eventData) => {
      const targetRoles = EVENT_ROLE_MAP[eventName] || [];
      
      targetRoles.forEach((role) => {
        io.to(`role:${role}`).emit(eventName, eventData);
      });

      // Broadcast to zone/depot rooms
      if (eventData.zoneCode) {
        io.to(`zone:${eventData.zoneCode}`).emit(eventName, eventData);
      }
      if (eventData.depotId) {
        io.to(`depot:${eventData.depotId}`).emit(eventName, eventData);
      }

      logger.debug('Event broadcasted via socket:', { eventName, roles: targetRoles });
    });
  });
};

/**
 * Track active connection
 */
const trackConnection = (socketId, userInfo) => {
  const { userId, role, zoneCode, depotId } = userInfo;

  // Track by user ID
  if (!activeConnections.byUserId[userId]) {
    activeConnections.byUserId[userId] = [];
  }
  activeConnections.byUserId[userId].push(socketId);

  // Track by role
  if (!activeConnections.byRole[role]) {
    activeConnections.byRole[role] = [];
  }
  activeConnections.byRole[role].push(socketId);

  // Track by zone
  if (zoneCode) {
    if (!activeConnections.byZone[zoneCode]) {
      activeConnections.byZone[zoneCode] = [];
    }
    activeConnections.byZone[zoneCode].push(socketId);
  }

  // Track by depot
  if (depotId) {
    if (!activeConnections.byDepot[depotId]) {
      activeConnections.byDepot[depotId] = [];
    }
    activeConnections.byDepot[depotId].push(socketId);
  }

  // Track socket details
  activeConnections.sockets[socketId] = userInfo;
};

/**
 * Untrack active connection
 */
const untrackConnection = (socketId) => {
  const userInfo = activeConnections.sockets[socketId];
  if (!userInfo) return;

  const { userId, role, zoneCode, depotId } = userInfo;

  // Remove from user tracking
  if (activeConnections.byUserId[userId]) {
    activeConnections.byUserId[userId] = activeConnections.byUserId[userId].filter(
      (id) => id !== socketId
    );
  }

  // Remove from role tracking
  if (activeConnections.byRole[role]) {
    activeConnections.byRole[role] = activeConnections.byRole[role].filter(
      (id) => id !== socketId
    );
  }

  // Remove from zone tracking
  if (zoneCode && activeConnections.byZone[zoneCode]) {
    activeConnections.byZone[zoneCode] = activeConnections.byZone[zoneCode].filter(
      (id) => id !== socketId
    );
  }

  // Remove from depot tracking
  if (depotId && activeConnections.byDepot[depotId]) {
    activeConnections.byDepot[depotId] = activeConnections.byDepot[depotId].filter(
      (id) => id !== socketId
    );
  }

  // Remove socket details
  delete activeConnections.sockets[socketId];
};

/**
 * Broadcast event to specific roles
 */
const broadcastToRoles = (eventName, data, roles) => {
  if (!io) return;
  
  roles.forEach((role) => {
    io.to(`role:${role}`).emit(eventName, data);
  });
};

/**
 * Broadcast event to specific zone
 */
const broadcastToZone = (eventName, data, zoneCode) => {
  if (!io) return;
  io.to(`zone:${zoneCode}`).emit(eventName, data);
};

/**
 * Broadcast event to specific depot
 */
const broadcastToDepot = (eventName, data, depotId) => {
  if (!io) return;
  io.to(`depot:${depotId}`).emit(eventName, data);
};

/**
 * Broadcast event to specific user
 */
const broadcastToUser = (eventName, data, userId) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(eventName, data);
};

/**
 * Get active connections count
 */
const getConnectionStats = () => {
  return {
    totalConnections: Object.keys(activeConnections.sockets).length,
    byRole: Object.keys(activeConnections.byRole).reduce((acc, role) => {
      acc[role] = activeConnections.byRole[role].length;
      return acc;
    }, {}),
    byZone: Object.keys(activeConnections.byZone).reduce((acc, zone) => {
      acc[zone] = activeConnections.byZone[zone].length;
      return acc;
    }, {}),
    byDepot: Object.keys(activeConnections.byDepot).reduce((acc, depot) => {
      acc[depot] = activeConnections.byDepot[depot].length;
      return acc;
    }, {}),
  };
};

module.exports = {
  initializeSocket,
  broadcastToRoles,
  broadcastToZone,
  broadcastToDepot,
  broadcastToUser,
  getConnectionStats,
  getIO: () => io,
};
