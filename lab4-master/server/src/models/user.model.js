/**
 * @class User
 */
class User {
  constructor(name, password) {
    this.socket = null;
    this.currentRoom = null;
    this.name = name;
    this.password = password;
    this.admin = false;
  }
}

module.exports = User;
