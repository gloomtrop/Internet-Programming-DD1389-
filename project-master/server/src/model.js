const Room = require('./models/room.model');
const User = require('./models/user.model');
const db = require('./database');

/**
 * rooms & users are effectively hash maps with the name of the entry serving as a unique key.
 */
let rooms = {};
let users = {};

/**
 * unregisteredSockets is used as a temporary pool of sockets
 * that belonging to users who are yet to login.
 */
let nextUnregisteredSocketID = 0;
let unregisteredSockets = {};

// Will be initialized in the exports.init function
exports.io = undefined;

/**
 * Initialize the model
 * @param { { io: SocketIO.Server} } config - The configurations needed to initialize the model.
 * @returns {void}
 */
exports.init = ({ io }) => {
  exports.io = io;
};

/**
 * Add a socket.io socket to the pool of unregistered sockets
 * @param {SocketIO.Socket} socket - The socket.io socket to add to the pool.
 * @returns {Number} The ID of the socket in the pool of unregistered sockets.
 */
exports.addUnregisteredSocket = (socket) => {
  const socketID = nextUnregisteredSocketID;
  nextUnregisteredSocketID += 1;

  unregisteredSockets[socketID] = socket;
  return socketID;
};
const assignUnregisteredSocket = (socketID) => {
  const socket = unregisteredSockets[socketID];
  unregisteredSockets = Object.keys(unregisteredSockets)
    .filter((sockID) => sockID !== socketID)
    .reduce((res, sockID) => ({ ...res, [sockID]: unregisteredSockets[sockID] }), {});

  return socket;
};

/**
 * Add a message to a room & push out the message to all connected clients
 * @param {String} roomName - The name of the room to add the message to.
 * @param {String} message - The message to add.
 * @returns {void}
 */
// exports.addMessage = (roomName, message) => {
// exports.findRoom(roomName).addMessage(message);
//   exports.io.in(roomName).emit('msg', message);
//   console.log(roomName, message);
// };

/**
 * Creates a user with the given name.
 * @param {String} name - The name of the user.
 * @param {Number} socketID - An optional ID of a socket.io socket in the unregistered sockets pool.
 * @see model.addUnregisteredSocket
 * @returns {void}
 */
exports.addUser = (name, socketID = undefined) => {
  users[name] = new User(name);
  if (socketID !== undefined) {
    users[name].socket = assignUnregisteredSocket(socketID);
  }
  // users[name].resetTimer();
};

exports.addTimer = (name) => {
  const user = this.findUser(name);
  if (user.time !== null) {
    clearTimeout(user.time);
  }
  user.time = setTimeout(() => {
    user.logout = true;
    console.log('Removed User');
  }, 10000);

  if (user === undefined) {
    console.log('Undefined user timer');
  }
};

/**
 * Updated the socket associated with the user with the given name.
 * @param {String} name - The name of the user.
 * @param {SocketIO.Socket} socket - A socket.io socket.
 * @returns {void}
 */
exports.updateUserSocket = (name, socket) => {
  users[name].socket = socket;
};

/**
 * Returns the user object with the given name.
 * @param {String} name - The name of the user.
 * @returns {User}
 */
exports.findUser = (name) => users[name];

/**
 * Removes the room object with the matching name.
 * @param {String} name - The name of the room.
 * @returns {void}
 */
exports.removeUser = (name) => {
  users = Object.values(users)
    .filter((user) => user.name !== name)
    .reduce((res, user) => ({ ...res, [user.name]: user }), {});
};

/**
 * Creates a room with the given name.
 * @param {String} name - The name of the room.
 * @returns {void}
 */
exports.addRoom = (name, owner) => {
  rooms[name] = new Room(name, owner);
  // const user = exports.findUser(owner);
  // PROBLEM: KAN INTE HITTA USER EFTERSOM INTE L??ST IN FR??N DATABASEN
  // N??R SERVERN STARTAR. M??STE DRF SPARA ??GDA RUM I DATABASEN P?? USER :/

  // user.addOwnership(name);
  // console.log(user.ownedRooms);
  exports.io.in('roomlist').emit('add', rooms);
};

exports.addRoomDB = (name, owner) => {
  const room = exports.findRoom(name);
  const txt = room.text;
  const members = JSON.stringify(room.members);
  db.serialize(() => {
    const statement = db.prepare('INSERT INTO documents (name, text, owner, members) VALUES (?,?,?,?)');
    statement.run(`${name}`, `${txt}`, `${owner}`, `${members}`);
    statement.finalize();
  });
};

exports.editText = (roomName, text) => {
  const room = exports.findRoom(roomName);
  room.editText(text);
  db.serialize(() => {
    const statement = db.prepare('UPDATE documents SET text=? WHERE name=?');
    statement.run(`${text}`, `${room.name}`);
    statement.finalize();
  });


  exports.io.in(roomName).emit('edit', text);
};

/**
 * Returns all the Rooms.
 * @returns {Room[]}
 */
exports.getRooms = () => Object.values(rooms);

/**
 * Removes the room object with the matching name.
 * @param {String} name - The name of the room.
 * @returns {void}
 */
exports.removeRoom = (name) => {
  rooms = Object.values(rooms)
    .filter((room) => room.name !== name)
    .reduce((res, room) => ({ ...res, [room.name]: room }), {});
};

exports.addRoomMember = (roomname, username) => {
  const room = exports.findRoom(roomname);
  room.addMember(username);
  const members = JSON.stringify(room.members);
  db.serialize(() => {
    const statement = db.prepare('UPDATE documents SET members=? WHERE name=?');
    statement.run(`${members}`, `${room.name}`);
    statement.finalize();
  });
};

/**
 * Return the room object with the matching name.
 * @param {String} name - The name of the room.
 * @returns {Room}
 */
exports.findRoom = (name) => rooms[name];
