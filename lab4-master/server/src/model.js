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
const unregisteredSockets = {};

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
// const assignUnregisteredSocket = (socketID) => {
//   const socket = unregisteredSockets[socketID];
//   unregisteredSockets = Object.keys(unregisteredSockets)
//     .filter((sockID) => sockID !== socketID)
//     .reduce((res, sockID) => ({ ...res, [sockID]: unregisteredSockets[sockID] }), {});

//   return socket;
// };

/**
 * Add a message to a room & push out the message to all connected clients
 * @param {String} roomName - The name of the room to add the message to.
 * @param {String} message - The message to add.
 * @returns {void}
 */
// THIS IS WHERE THE MESSAGE IS BEING SEND BY SOCKET.IO
exports.addMessage = (roomName, message) => {
  // exports.findRoom(roomName).addMessage(message);
  exports.io.in(roomName).emit('msg', message);
  console.log(roomName, message);
};

exports.updateRooms = () => {
  exports.io.in('ListRoom').emit('update', rooms);
};

exports.removeReservation = (room) => {
  if (room.booked === false) {
    room.reserv = false;
    this.updateRooms();
  }
};

/**
 * Creates a user with the given name.
 * @param {String} name - The name of the user.
 * @param {Number} socketID - An optional ID of a socket.io socket in the unregistered sockets pool.
 * @see model.addUnregisteredSocket
 * @returns {void}
 */
exports.addUser = (name, password = undefined, socketID = undefined) => {
  users[name] = new User(name);
  if (password !== undefined) {
    users[name].password = password;
  }

  if (socketID !== undefined) {
    // users[name].socket = assignUnregisteredSocket(socketID);
    // users[name].socket = addUnregisteredSocket(socketID);
    users[name].socket = socketID;
    console.log(users[name].socket.id, 'Socket');
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

// exports.getSocket = (name) => users[name].socket;

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
exports.addRoom = (name) => {
  rooms[name] = new Room(name);
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

exports.addBooked = (name, bookedby) => {
  users[name].bookedBy = bookedby;
};

exports.addToDB = (name) => {
  const names = name.split(' ');
  const admin = names[0];
  const time = names[1];
  const room = this.findRoom(name);
  console.log(name, room.bookedBy, 'Adding to DB');
  db.serialize(() => {
    const statement = db.prepare('INSERT INTO rooms (name, time, booked_by) VALUES (?,?,?)');
    console.log(`${admin}`, `${time}`, `${room.bookedBy}`);
    statement.run(`${admin}`, `${time}`, `${room.bookedBy}`);
    statement.finalize();
  });
};

exports.changeInDB = (name) => {
  const room = this.findRoom(name);
  const names = name.split(" ");
  const admin = names[0];
  const time = names[1];
  db.serialize(() => {

    const statement = db.prepare(`UPDATE rooms
    SET name = ? , time = ? , booked_by = ?
    WHERE name = ? AND time = ?`);
    console.log(`${admin}`, `${time}`, `${room.bookedBy}`);
    statement.run(`${admin}`, `${time}`, `${room.bookedBy}`,`${admin}`, `${time}`);
    statement.finalize();
  });
}

exports.removeInDB = (name) => {
  const names = name.split(" ");
  const admin = names[0];
  const time = names[1];
  db.serialize(() => {
    const statement = db.prepare(`DELETE FROM rooms 
    WHERE name = ? AND time = ?`);
    statement.run(`${admin}`, `${time}`);
    statement.finalize();
  });
}
/**
 * Return the room object with the matching name.
 * @param {String} name - The name of the room.
 * @returns {Room}
 */
exports.findRoom = (name) => rooms[name];

// CHANGE THE ROOM TO RESERVED
exports.reserveRoom = (name) => {
  rooms[name].reserv = true;
};
