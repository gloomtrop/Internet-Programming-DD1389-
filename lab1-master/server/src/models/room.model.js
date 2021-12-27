/**
 * @class Room
 */
class Room {
  constructor(name, owner) {
    this.messages = [];
    this.text = '';
    this.name = name;
    this.owner = owner;
    this.members = [];
  }

  addMessage(message) {
    this.messages.push(message);
  }

  addMember(username) {
    this.members.push(username);
  }

  editText(txt) {
    this.text = txt;
  }
}

module.exports = Room;
