const { SessionManager } = require('../sessionManager');

const requireAuth = (req, res, next) => {
  console.log(req.get('host'), req.originalUrl, 'Required Auth');
  console.log(req.body);
  console.log(req.headers.cookie);

  try {
    req.headers.cookie.split('; ').forEach((cookie) => {
      if (cookie.split('=')[0] === 'session-id') {
        if (SessionManager.has(parseFloat(cookie.split('=').pop(0)))) {
          next();
        } else {
          throw new Error();
        }
      }
    });
  } catch (error) {
    res.redirect('/login');
  }
};

module.exports = {
  requireAuth,
};
