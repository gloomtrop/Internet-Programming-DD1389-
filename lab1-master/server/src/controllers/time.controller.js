const model = require('../model.js');

const timer = (req, res, next) => {
  console.log('Timer');

  const maybeUser = model.findUser(req.session.userID);
  console.log(req.session.userID, 'User ID');

  if (maybeUser !== undefined) {
    model.addTimer(maybeUser.name);
    console.log('Username:', maybeUser.name);
  }
  next();
};

module.exports = { timer };
