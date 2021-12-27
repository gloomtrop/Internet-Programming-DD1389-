const express = require('express');
const model = require('../model.js');

const router = express.Router();

/**
 * requireAuth is an endpoint guard for logged in users.
 * aka: A middle ware used to limit access to an endpoint to authenticated users
 * @param {Request} req
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @param {Response} res
 * @param {Function} next
 * @returns {void}
 */
const requireAuth = (req, res, next) => {
  // CHANGE TO THE FACT THAT IF SOMEONE IS IN THE ROOM, ITS NOT ALLOWED TO GO INTO THE ROOM
  const { url } = req;
  const l = url.split('/');
  const roomString = l[2].replace('%20', ' ');
  console.log(roomString);

  const room = model.findRoom(roomString);
  console.log(room, 'Does it exist?');
  if (room === undefined) {
    res.status(404).json({
      msg: `No room with ID: ${req.params.room}`,
      href_roomList: '/roomList',
    });
    return;
  }

  if (room.reserv === true && req.body.message === undefined) {
    console.log('Reserved');
    res.status(401).json({
      msg: `Someone has taken this room: ${req.params.room}`,
      href_roomList: '/roomList',
    });
  } else {
    next();
  }
};

const requireAdmin = (req, res, next) => {
  console.log('require Admin');
  console.log(req.body.username, 'res.body.username');
  next();
  //
  // console.log(req.body.username, 'Name of Admin');
};


/**
 * Tells the client if they are in an authenticated user-session.
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
router.get('/isAuthenticated', (req, res) => {
  const maybeUser = model.findUser(req.session.userID);
  res.status(200).json({
    isAuthenticated: maybeUser !== undefined,
    username: maybeUser !== undefined ? maybeUser.name : 'N/A',
  });
});

/**
 * Attempts to authenticate the user-session
 * @param {String} req.body.username - The username of the user attempting to authenticate
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
router.post('/authenticate', (req, res) => {
  const user = model.findUser(req.body.username);
  console.log(user.password, 'user password');
  console.log(req.body.password, 'JSON password');
  if (user === undefined || user.password !== req.body.password) {
    res.sendStatus(403);
  } else {
    req.session.userID = req.body.username;
    req.session.save((err) => {
      if (err) console.error(err);
      else console.debug(`Saved userID: ${req.session.userID}`);
    });

    // TODO: Only send 200 when the login was successful
    res.sendStatus(200);
  }
});

router.post('/remove', (req, res) => {
  console.log(req.body.name);
  const roomname = req.body.name.split(' ');
  if (roomname[0] !== req.session.userID) {
    res.status(403);
  } else {
    if (model.findRoom(req.body.name)) {
      console.log('Found room');
      model.removeRoom(req.body.name);
      model.removeInDB(req.body.name);
      model.updateRooms();
    }
    res.status(200);
  }
});

router.post('/add', (req, res) => {
  console.log('POST add');
  console.log(req.body.name);
  if (req.body.name !== undefined) {
    const name = `${req.session.userID} ${req.body.name}`;
    console.log('Found room');
    model.addRoom(name);
    model.updateRooms();
    model.addToDB(name);
  }
  res.status(200);
});

router.post('/logout', (req, res) => {
  console.log("Loggin out")
  req.session = undefined;
  // req.session.save((err) => {
  //   if (err) console.error(err);
  //   else console.debug(`Saved userID: ${req.session}`);
  // });
  res.status(200);
});
// TODO: Add 'create account' route.
// The 'authenticate' route is only supposed to check if the user can login.

module.exports = { router, requireAuth, requireAdmin };
