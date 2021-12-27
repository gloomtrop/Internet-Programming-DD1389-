const SessionManager = (() => {
  const context = {
    sessions: new Map(),
  };

  const api = {
    has(sessionID) {
      return context.sessions.has(sessionID);
    },
    get(sessionID) {
      return context.sessions.get(sessionID);
    },
    new() {
      const sessionID = Math.random();
      context.sessions.set(sessionID, {
        id: sessionID,
      });

      return context.sessions.get(sessionID);
    },
    delete(sessionID) {
      Object.keys(context.sessions).forEach((key) => {
        if (key.match(parseInt(sessionID, 10))) {
          delete context.session[key];
          console.log('Deleted key');
        }
      });
    },
  };

  return api;
})();

module.exports = {
  SessionManager,
};
