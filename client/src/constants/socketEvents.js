// Centralized socket event names — import and reuse everywhere
export const SOCKET_EVENTS = {
  REGISTER: 'register',
  NOTIFICATION: 'notification',

  GAME: {
    CONFIG_UPDATED: 'game:configUpdated',
  },

  PVP: {
    ROOM_UPDATED: 'pvp:roomUpdated',
    ROOM_STARTED: 'pvp:roomStarted',
    ROOM_FINISHED: 'pvp:roomFinished',
    ROOM_DELETED: 'pvp:roomDeleted',

    JOIN_CHANNEL: 'pvp:joinRoomChannel',
    LEAVE_CHANNEL: 'pvp:leaveRoomChannel',
    LIST: 'pvp:list',
  },

  SOCIAL: {
    FRIEND_REQUEST: 'friends:request',
    FRIEND_UPDATE: 'friends:update',
    FRIEND_REMOVED: 'friends:removed',
    CHAT_MESSAGE: 'chat:message',
    CHAT_READ: 'chat:read',
  },
};
