const express = require('express');
const model = require('../model.js');

const router = express.Router();

/**
 * Fetch the list the currently active rooms
 * @returns {void}
 */
router.get('/roomList', (req, res) => {
  const maybeUser = model.findUser(req.session.userID);
  if (maybeUser.logout === true) {
    console.log('Sending 301 message');
    req.session.userID = undefined;
    res.sendStatus(301);
    return;
  }
  const rooms = model.getRooms();
  const user = model.findUser(req.session.userID);
  user.socket.join('roomlist');
  res.status(200).json({ list: rooms });
});

router.post('/roomList/add', (req, res) => {
  const maybeUser = model.findUser(req.session.userID);
  if (maybeUser.logout === true) {
    console.log('Sending 301 message');
    req.session.userID = undefined;
    res.sendStatus(301);
    return;
  }
  const user = model.findUser(req.session.userID);
  const roomName = req.body.name.trim(); // Delete any whitespace infront of name
  if (roomName === '') {
    res.status(403).json({
      msg: 'You must choose a document name!',
      href_join: '/roomList',
    });
    return;
  }

  if (model.findRoom(roomName) !== undefined) {
    res.status(403).json({
      msg: 'Document with that name already exists!',
      href_join: '/roomList',
    });
    return;
  }
  model.addRoom(roomName, user.name);
  model.addRoomDB(roomName, user.name);
  res.sendStatus(200);
});

/**
 * Join the specific room.
 * This will allow the user-session to listen to and post messages in the given room.
 * @param {String} req.params.room - The id of the room you would like to join
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */


router.get('/room/:room/access', (req, res) => {
  console.log('Access');

  const room = model.findRoom(req.params.room);
  const maybeUser = model.findUser(req.session.userID);
  if (maybeUser === undefined) {
    console.log('Undefined user');
  } else {
    console.log(maybeUser.name, 'name of user');
  }
  // if (true){
  //   model.removeUser(maybeUser.name);
  //   res.sendStatus(301);
  //   return;
  // }
  if (maybeUser.logout === true) {
    console.log('Sending 301 message');
    req.session.userID = undefined;
    res.sendStatus(301);
    return;
  }

  if (room === undefined) {
    res.status(404).json({
      msg: `No room with ID: ${req.params.room}`,
      href_roomList: '/roomList',
    });
    return;
  }

  const user = model.findUser(req.session.userID);
  if (!room.members.includes(user.name) && user.name !== room.owner) {
    //  Only allow owner and members to join room
    res.status(401).send({
      msg: `You must be the owner or a member of room: ${req.params.room}`,
      href_roomList: '/roomList',
    });
    return;
  }
  // Send http response
  res.sendStatus(200);
});

router.get('/room/:room/join', (req, res) => {
  console.log('Join');
  const maybeUser = model.findUser(req.session.userID);
  console.log(maybeUser.name, 'name of user');

  if (maybeUser.logout === true) {
    console.log('Sending 301 message');
    req.session.userID = undefined;
    res.sendStatus(301);
    return;
  }
  const room = model.findRoom(req.params.room);
  if (room === undefined) {
    res.status(404).json({
      msg: `No room with ID: ${req.params.room}`,
      href_roomList: '/roomList',
    });
    return;
  }

  const user = model.findUser(req.session.userID);
  if (!room.members.includes(user.name) && user.name !== room.owner) {
    //  Only allow owner and members to join room
    res.status(401).send({
      msg: `You must be the owner or a member of room: ${req.params.room}`,
      href_roomList: '/roomList',
    });
    return;
  }

  // Join the right socket.io room
  user.currentRoom = room.name;
  user.socket.join(user.currentRoom);
  // Send http response
  res.status(200).send({
    list: room.messages,
    text: room.text,
    msg: `Successfully joined room: ${room.name}`,
    href_messages: `/room/${room.name}`,
    href_send_message: `/room/${room.name}/message`,
  });
});

/**
 * Send a message in the given room.
 * @param {String} req.params.room - The id of the room you would like to join
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
router.post('/room/:room/message', (req, res) => {
  const maybeUser = model.findUser(req.session.userID);
  if (maybeUser.logout === true) {
    console.log('Sending 301 message');
    req.session.userID = undefined;
    res.sendStatus(301);
    return;
  }
  const user = model.findUser(req.session.userID);
  if (user.currentRoom !== req.params.room) {
    res.status(403).json({
      msg: 'You may only send messages in rooms you are partaking in.',
      href_join: `/room/${req.params.room}/join`,
    });
    return;
  }

  const room = model.findRoom(req.params.room);
  model.addMessage(room.name, `${user.name}: ${req.body.message}`);

  res.sendStatus(200);
});

router.post('/room/:room/edit', (req, res) => {
  const maybeUser = model.findUser(req.session.userID);
  if (maybeUser.logout === true) {
    console.log('Sending 301 message');
    req.session.userID = undefined;
    res.sendStatus(301);
    return;
  }
  const user = model.findUser(req.session.userID);
  if (user.currentRoom !== req.params.room) {
    res.status(403).json({
      msg: 'You may only edit documents in rooms you are partaking in.',
      href_join: `/room/${req.params.room}/join`,
    });
    return;
  }

  const room = model.findRoom(req.params.room);
  model.editText(room.name, `${req.body.text}`);
  res.sendStatus(200);
});

router.post('/room/:room/add', (req, res) => {
  const maybeUser = model.findUser(req.session.userID);
  if (maybeUser.logout === true) {
    console.log('Sending 301 message');
    req.session.userID = undefined;
    res.sendStatus(301);
    return;
  }
  const user = model.findUser(req.session.userID);
  if (user.currentRoom !== req.params.room) {
    res.status(403).json({
      msg: 'You may only add members in rooms you are partaking in.',
      href_join: `/room/${req.params.room}/join`,
    });
    return;
  }

  const room = model.findRoom(req.params.room);
  model.addRoomMember(room.name, req.body.username);
  res.sendStatus(200);
});

module.exports = { router };
