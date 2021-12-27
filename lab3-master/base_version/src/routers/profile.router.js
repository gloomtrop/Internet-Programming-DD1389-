const { Router } = require('express');
const { readFile, resolvePublicPath } = require('../util');

const privateRouter = Router();

privateRouter.get('/profile', async (req, res) => {
  console.log(req.get('host'), req.originalUrl, 'Private Router Profile');
  let username = '';
  req.headers.cookie.split('; ').forEach((cookie) => {
    if (cookie.split('=')[0] === 'username') {
      username = cookie.split('=').pop(0);
    }
  });
  const profileDoc = (await readFile(resolvePublicPath('profile.html')))
    .replace('$username$', username);

  res.status(200).send(profileDoc);
});

module.exports = {
  privateRouter,
};
