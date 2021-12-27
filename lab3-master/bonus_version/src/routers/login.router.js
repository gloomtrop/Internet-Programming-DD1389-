const { Router } = require('express');
const { readFile, resolvePublicPath } = require('../util');
const { SessionManager } = require('../sessionManager');

const publicRouter = Router();

publicRouter.get('/', (req, res) => {
  res.redirect('/login');
});

publicRouter.get('/login', async (req, res) => {
  try {
    req.headers.cookie.split('; ').forEach((cookie) => {
      if (cookie.split('=')[0] === 'session-id') {
        if (SessionManager.has(parseFloat(cookie.split('=').pop(0)))) {
          res.redirect('/profile');
        } else {
          throw new Error();
        }
      }
    });
  } catch (error) {
    // Not empty
  }
  console.log(req.body, 'Login Router');

  const loginDoc = await readFile(resolvePublicPath('login.html'));

  res.status(200).send(loginDoc);
});

publicRouter.get('/register', async (req, res) => {
  console.log(req.body);
  try {
    req.headers.cookie.split('; ').forEach((cookie) => {
      if (cookie.split('=')[0] === 'session-id') {
        if (SessionManager.has(parseFloat(cookie.split('=').pop(0)))) {
          res.redirect('/profile');
        } else {
          throw new Error();
        }
      }
    });
  } catch (error) {
    // Not empty
  }

  const registerDoc = await readFile(resolvePublicPath('register.html'));

  res.status(200).send(registerDoc);
});

module.exports = {
  publicRouter,
};
