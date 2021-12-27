const express = require('express');

const router = express.Router();

// router.post('/admin/join', (req,res) =>{
//     console.log("From list");
// })

router.post('/admin/join', (req, res) => {
  console.log(req.body);
  console.log('Want to join Admin room');
  res.status(200);
  // const room = model.findRoom(req.params.room);
  // console.log(room, 'Room is here');
  // console.log('Joining room');

  // if (room === undefined) {
  //   res.status(404).json({
  //     msg: `No room with ID: ${req.params.room}`,
  //     href_roomList: '/roomList',
  //   });
  //   return;
  // }


  // if (room.reserv === true) {
  //   res.status(401).json({
  //     msg: `Someone has taken this room: ${req.params.room}`,
  //     href_roomList: '/roomList',
  //   });
  //   return;
  // }
});

module.exports = { router };
