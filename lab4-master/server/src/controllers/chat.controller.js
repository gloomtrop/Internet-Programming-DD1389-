const express = require('express');
const model = require('../model.js');

const router = express.Router();

/**
 * Fetch the list the currently active rooms
 * @returns {void}
 */
/**
 * Join the specific room.
 * This will allow the user-session to listen to and post messages in the given room.
 * @param {String} req.params.room - The id of the room you would like to join
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
router.get('/room/:room/join', (req, res) => {
  const room = model.findRoom(req.params.room);
  console.log(room, 'Room is here');
  console.log('Joining room');

  if (room === undefined) {
    res.status(404).json({
      msg: `No room with ID: ${req.params.room}`,
      href_roomList: '/roomList',
    });
    return;
  }


  if (room.reserv === true) {
    res.status(401).json({
      msg: `Someone has taken this room: ${req.params.room}`,
      href_roomList: '/roomList',
    });
    return;
  }


  model.reserveRoom(req.params.room);
  model.updateRooms();

  setTimeout(() => {
    model.removeReservation(room);
    model.updateRooms();
  }, 10000);

  console.log(room, 'ROOM');

  const user = model.findUser(req.session.userID);
  console.log(req.session.userID);
  // Join the right socket.io room
  if (user !== undefined) {
    user.currentRoom = room.name;
    console.log(user.currentRoom, 'Current room');
    // user.socket.join(user.currentRoom);
  }

  // Send http response
  res.status(200).json({
    list: room.messages,
    msg: `Successfully joined room: ${room.name}`,
    href_messages: `/room/${room.name}`,
    href_send_message: `/room/${room.name}/message`,
  });
  console.log('Has sent responds');
});

/**
 * Send a message in the given room.
 * @param {String} req.params.room - The id of the room you would like to join
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
router.post('/room/:room/message', (req, res) => {
  const user = model.findUser(req.session.userID);
  if (user !== undefined) {
    if (user.currentRoom !== req.params.room) {
      res.status(403).json({
        msg: 'You may only send messages in rooms you are partaking in.',
        href_join: `/room/${req.params.room}/join`,
      });
      return;
    }
    const room = model.findRoom(req.params.room);
    room.booked = true;
    room.bookedBy = req.body.message;
    model.changeInDB(req.params.room);
    model.updateRooms();
  }
  res.sendStatus(200);
});

router.post('/cancel/:room', (req, res) => {
  const room = model.findRoom(req.params.room);
  room.reserv = false;
  model.updateRooms();

  res.sendStatus(200);
});

module.exports = { router };
