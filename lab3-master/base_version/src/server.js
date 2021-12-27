const express = require('express'); // Express is a very common webserver for Node.js
const AuthenticationRouter = require('./routers/auth.router');
const ProfileRouter = require('./routers/profile.router');
const LoginRouter = require('./routers/login.router');
const { requireAuth } = require('./middleware/requireAuth');
const { logAndTime } = require('./middleware/logAndTime');

const port = 8989;
const app = express();

// Register a custom middleware for logging incoming requests
app.use(logAndTime);

// Register a middleware that adds support for a URL encoded request body.
// This is needed in order to send data to express using a FORM with a POST action.
app.use(express.urlencoded({
  extended: true,
}));

app.use('/api', AuthenticationRouter.publicRouter);
app.use('/api', requireAuth, AuthenticationRouter.privateRouter); // For Logout

app.use('/', LoginRouter.publicRouter);
app.use('/', requireAuth, ProfileRouter.privateRouter); // For Profile

app.listen(port, () => {
  console.info(`Listening on port ${port}!`);
});
