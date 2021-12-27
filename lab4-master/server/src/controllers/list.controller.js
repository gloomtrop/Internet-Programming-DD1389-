const express = require('express');
const model = require('../model.js');

const router = express.Router();

router.get('/roomList', (req, res) => {
  const rooms = model.getRooms();
  console.log(rooms);
  console.log('Hej');
  res.status(200).json({ list: rooms });
});


module.exports = { router };
