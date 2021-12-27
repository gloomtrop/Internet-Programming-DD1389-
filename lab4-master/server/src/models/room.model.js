/**
 * @class Room
 */
class Room {
  constructor(name) {
    this.messages = [];
    this.name = name;
    this.reserv = false;
    this.booked = false;
    this.bookedBy = undefined;
  }

  addMessage(message) {
    this.messages.push(message);
  }
}

module.exports = Room;
