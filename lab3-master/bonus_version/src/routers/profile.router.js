const { Router } = require('express');
const { SessionManager } = require('../sessionManager');
const { readFile, resolvePublicPath } = require('../util');

const privateRouter = Router();

privateRouter.get('/profile', async (req, res) => {
  console.log(req.get('host'), req.originalUrl, 'Private Router Profile');
  let username = '';
  let cookieId = '';
  req.headers.cookie.split('; ').forEach((cookie) => {
    const splitter = cookie.split('=');
    if (splitter[0] === 'username') {
      username = splitter.pop(0);
    }
    if (splitter[0] === 'session-id') {
      cookieId = splitter.pop(0);
    }
  });

  res.clearCookie('session-id');
  res.clearCookie('username');

  SessionManager.delete(cookieId);

  res.cookie('session-id', cookieId, { maxAge: 10000 });
  res.cookie('username', username, { maxAge: 10000 });

  const profileDoc = (await readFile(resolvePublicPath('profile.html')))
    .replace('$username$', username);

  res.status(200).send(profileDoc);
});

module.exports = {
  privateRouter,
};
