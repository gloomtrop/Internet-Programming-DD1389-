// enhances log messages with timestamps etc
const betterLogging = require('better-logging');

const { Theme } = betterLogging;
betterLogging(console, {
  color: Theme.green,
});

const path = require('path'); // helper library for resolving relative paths
const expressSession = require('express-session');
const socketIOSession = require('express-socket.io-session');
const express = require('express');
const http = require('http');


console.logLevel = 4; // Enables debug output
const publicPath = path.join(__dirname, '..', '..', 'client', 'dist');
const port = 8989; // The port that the server will listen to
const app = express(); // Creates express app

const httpServer = http.Server(app);
const io = require('socket.io').listen(httpServer); // Creates socket.io app
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
const list = require('./controllers/list.controller.js');
const chat = require('./controllers/chat.controller.js');
// const admin = require('./controllers/admin.controller.js');

app.use('/api', auth.router);

// app.use('/api', admin.router);
// All chat endpoints require the user to be authenticated
// app.use('/api', auth.requireAuth, chat.router);
app.use('/api', list.router);


// THIS WILL BE NECESARY TO HAVE WHEN BLOCKING OTHER STUDENT TO GET TO ROOM
app.use('/api', auth.requireAuth, chat.router); // Not anymore

// app.use('/api', auth.requireAdmin, admin.router);

// Init model
const model = require('./model.js');

model.init({ io }); // MÖJLIGEN ADDERA IN FLER RUM FRÅN SQL DATABAS, ÄVEN ADMINS

db.serialize(() => {
  db.each('SELECT name, time, booked_by FROM rooms', (err, row) => {
    if (err) { throw new Error(err); }
    console.log(row.booked_by, 'Booked By');
    const roomname = `${row.name} ${row.time}`;
    model.addRoom(roomname);
    if (row.booked_by !== null) {
      const room = model.findRoom(roomname);
      room.bookedBy = row.booked_by;
      room.booked = true;
      room.reserv = true;
      console.log(model.findRoom(roomname).bookedBy, "Hej")
    }
  });
  console.log('Added Rooms');
});

db.serialize(() => {
  db.each('SELECT username, password FROM users', (err, row) => {
    if (err) { throw new Error(err); }
    model.addUser(row.username, row.password);
  });
  console.log('Added Users');
});
// model.addRoom('Axel 12.00'); // demo call
// model.addRoom('Filip 12.20'); // demo call
// model.addRoom('Axel 12.35'); // demo call
// model.addRoom('Filip 12.40'); // demo call
// model.addRoom('Axel 12.50'); // demo call
// model.addRoom('Filip 12.55'); // demo call
// model.addUser('Axel');


// Handle connected socket.io sockets

io.on('connection', (socket) => {
  // This function serves to bind socket.io connections to user models
  // SHOULD BIND THIS TO ROOM MODELS INSTEAD, MAYBE ALSO FOR THE ADMINS BUT I DONT KNOW YET
  // Bind User to connection al3
  console.log(socket.handshake.session.userID, 'UserID');
  if (socket.handshake.session.userID
    && model.findUser(socket.handshake.session.userID) !== undefined
  ) {
    // If the current user already logged in and then reloaded the page
    model.updateUserSocket(socket.handshake.session.userID, socket);
  } else {
    const randomName = Math.random().toString(36).replace(/[^a-z]+/g, '');
    socket.join('ListRoom');
    model.addUser(randomName, socket);
    socket.handshake.session.userID = randomName;
    socket.handshake.session.socketID = socket.id;
    // socket.handshake.session.socketID = model.addUnregisteredSocket(socket);
    console.log(socket.handshake.session.socketID);
    socket.handshake.session.save((err) => {
      if (err) console.error(err);
      else console.debug(`Saved socketID: ${socket.handshake.session.socketID}`);
    });
  }
});

// Start server
httpServer.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
