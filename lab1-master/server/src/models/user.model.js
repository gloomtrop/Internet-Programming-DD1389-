/**
 * @class User
 */
//  const model = require('../model.js');
class User {
  constructor(name) {
    this.time = null;
    this.logout = null;
    this.socket = null;
    this.currentRoom = null;
    this.name = name;
    this.ownedRooms = [];
  }

  addOwnership(roomname) {
    this.ownedRooms.push(roomname);
  }
}

module.exports = User;
