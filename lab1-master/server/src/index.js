// enhances log messages with timestamps etc
const betterLogging = require('better-logging');
const helmet = require('helmet');

const { Theme } = betterLogging;
betterLogging(console, {
  color: Theme.green,
});

const path = require('path'); // helper library for resolving relative paths
const expressSession = require('express-session');
const socketIOSession = require('express-socket.io-session');
const express = require('express');
const https = require('https');
const fs = require('fs');

const privateKey = fs.readFileSync(path.resolve('./src/server.key'), 'utf8');
const certificate = fs.readFileSync(path.resolve('./src/server.cert'), 'utf8');
const credentials = { key: privateKey, cert: certificate };


console.logLevel = 4; // Enables debug output
const publicPath = path.join(__dirname, '..', '..', 'client', 'dist');
const port = 8989; // The port that the server will listen to
const app = express(); // Creates express app

const httpsServer = https.createServer(credentials, app);
const io = require('socket.io').listen(httpsServer); // Creates socket.io app

const db = require('./database');

// Setup middleware
app.use(betterLogging.expressMiddleware(console, {
  ip: { show: true, color: Theme.green.base },
  method: { show: true, color: Theme.green.base },
  header: { show: false },
  path: { show: true },
  body: { show: true },
}));
app.use(express.json()); /*
This is a middleware that parses the body of the request into a javascript object.
It's basically just replacing the body property like this:
req.body = JSON.parse(req.body)
*/
app.use(express.urlencoded({ extended: true }));

// Tells the browser not to load any scripts from origins different than the opened page
app.use(helmet.contentSecurityPolicy());

// Setup session
const session = expressSession({
  secret: 'Super secret! Shh! Do not tell anyone...',
  resave: true,
  saveUninitialized: true,
});
app.use(session);
io.use(socketIOSession(session, {
  autoSave: true,
  saveUninitialized: true,
}));

// Serve client
app.use(express.static(publicPath));/*
express.static(absolutePathToPublicDirectory)
This will serve static files from the public directory, starting with index.html
*/

// Bind REST controllers to /api/*
const auth = require('./controllers/auth.controller.js');
const chat = require('./controllers/chat.controller.js');
const time = require('./controllers/time.controller.js');

app.use('/api', time.timer, auth.router);
// All chat endpoints require the user to be authenticated
app.use('/api', time.timer, auth.requireAuth, chat.router);

// Init model
const model = require('./model.js');

model.init({ io });
// model.addRoom('test1', 'filip'); // demo call
// model.addRoom('test2', 'axel'); // demo call
db.serialize(() => {
  db.each('SELECT name, text, owner, members FROM documents', (err, row) => {
    if (err) { throw new Error(err); }
    const roomname = `${row.name}`;
    const txt = `${row.text}`;
    const owner = `${row.owner}`;
    const members = JSON.parse(row.members);

    model.addRoom(roomname, owner);
    const room = model.findRoom(roomname);
    room.text = txt;
    room.members = members;
  });
  console.log('Initialized documents from database');
});

// Handle connected socket.io sockets
io.on('connection', (socket) => {
  // This function serves to bind socket.io connections to user models

  if (socket.handshake.session.userID
    && model.findUser(socket.handshake.session.userID) !== undefined
  ) {
    // If the current user already logged in and then reloaded the page
    model.updateUserSocket(socket.handshake.session.userID, socket);
  } else {
    // Detta bör aldig hända då man endast ska kunna skapa en socket om man har en inloggning
    socket.handshake.session.socketID = model.addUnregisteredSocket(socket);
    socket.handshake.session.save((err) => {
      if (err) console.error(err);
      else console.debug(`Saved socketID: ${socket.handshake.session.socketID}`);
    });
  }
});

// Start server
httpsServer.listen(port, () => {
  console.log(`Listening on https://localhost:${port}`);
});
