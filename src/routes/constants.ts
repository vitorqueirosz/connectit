const USER = {
  ROOT: '/',
  ME: '/me',
  BASE: '/users',
  LOGIN: '/login',
  SPOTIFY_AUTH: '/spotify/:id',
};

const SESSION = {
  ROOT: '/',
  BASE: '/sessions',
  ALL: '/all',
  USER_SESSIONS: '/all/user',
  LISTENER: '/session-listener',
  USER_LISTENERS: '/session-listener/all/user',
  ACTIVE_USER_LISTENER: '/session-listener/active/user',
  ACTIVE_LISTENERS: '/session-listener/active',
};

export { USER, SESSION };
