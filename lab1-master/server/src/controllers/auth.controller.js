const express = require('express');
const bcrypt = require('bcrypt');
const model = require('../model.js');
const db = require('../database');

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
  const maybeUser = model.findUser(req.session.userID);
  // "auth" check
  if (maybeUser === undefined) {
    res.status(401).send('Unauthorized. Please make sure you are logged in before attempting this action again.');
    return;
  }
  next();
};

router.post('/profile', (req, res) => {
  const maybeUser = model.findUser(req.session.userID);
  if (maybeUser.logout === true) {
    console.log('Sending 301 message');
    req.session.userID = undefined;
    res.sendStatus(301);
  } else {
    res.sendStatus(200);
  }
});

router.post('/list', (req, res) => {
  const maybeUser = model.findUser(req.session.userID);
  if (maybeUser.logout === true) {
    console.log('Sending 301 message');
    req.session.userID = undefined;
    res.sendStatus(301);
  } else {
    res.sendStatus(200);
  }
});

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
  // TODO: Check if the user actually exists instead of creating a new one
  // model.addUser(req.body.username, req.session.socketID);
  const { username } = req.body;
  const { password } = req.body;
  console.log(username, password);
  db.serialize(() => {
    let foundUser = false;
    let hashedPass = '';
    db.each('SELECT username, password FROM users', (err, row) => {
      if (err) { throw new Error(err); }
      if (username === row.username) {
        foundUser = true;
        hashedPass = row.password;
      }
    }, () => {
      if (foundUser === false) {
        res.status(401).send('Unauthorised. User does not exist!');
      } else {
        bcrypt.compare(password, hashedPass, (err, result) => {
          if (result === true) {
            // const session = SessionManager.new();
            // res.cookie('session-id', session.id, { maxAge: 10000 });
            // res.cookie('username', user.username, { maxAge: 10000 }).redirect('/profile');
            model.addUser(username, req.session.socketID);
            req.session.userID = req.body.username;
            req.session.save((error) => {
              if (error) console.error(error);
            });
            res.sendStatus(200);
          } else {
            res.status(401).send('Unauthorised. Wrong password!');
          }
        });
      }
    });
  });
});

router.post('/unauthenticate', (req, res) => {
  //  Todo: do the opposite of /authenticate
  // Inactivate Logout button when the user is not logged in
  console.log('Unathenticate');
  const user = model.findUser(req.session.userID);
  console.log(req.session.userID);
  if (user !== undefined) {
    model.removeUser(user.name);
    res.sendStatus(200);
  } else {
    res.status(401).send('Unauthorised! Must be signed in to log out.');
  }
});

router.post('/passwordChange', (req, res) => {
  const maybeUser = model.findUser(req.session.userID);
  if (maybeUser.logout === true) {
    console.log('Sending 301 message');
    req.session.userID = undefined;
    res.sendStatus(301);
    return;
  }
  const saltRounds = 10;
  const { password1 } = req.body;
  const { password2 } = req.body;
  console.log(req.session.userID);
  console.log(password1);
  if (password1 !== password2) {
    console.log('Passwords didnt match', password1, password2);
    res.status(401).send('Passwords didnt match');
  } else {
    bcrypt.hash(password1, saltRounds, (err, hash) => {
      // Store hash in your password DB.
      db.serialize(() => {
        const statement = db.prepare('UPDATE users SET password = (?) WHERE username = (?);');
        statement.run(`${hash}`, `${req.session.userID}`);
        statement.finalize();
      });
    });
    res.sendStatus(200);
  }
});

router.post('/register', (req, res) => {
  // else if (!/\d/.test(username)) {
  //   res.redirect('/register?statusFail=Password must contain at least one digit');
  // } else if (!/\d/.test(username)) {
  //   res.redirect('/register?statusFail=Password must contain at least one digit');
  // } else if (username.length < 5 || password[0].length < 5 || password[1].length < 5) {
  //   res.redirect('/register?statusFail=Size must be atleast 5');
  // } else if (password[0] !== password[1]) {
  //   res.redirect("/register?statusFail=Passwords didn't match");
  // }

  const saltRounds = 10;
  const { username } = req.body;
  const { password } = req.body;
  let exists = false;
  db.serialize(() => {
    db.each('SELECT username, password FROM users', (err, row) => {
      if (err) {
        throw new Error(err);
      }
      if (username === row.username) {
        exists = true;
      }
    }, () => {
      if (exists) {
        res.status(401).send('Username already exists!');
      } else {
        bcrypt.hash(password, saltRounds, (err, hash) => {
          // Store hash in your password DB.
          db.serialize(() => {
            const statement = db.prepare('INSERT INTO users (username, password) VALUES (?,?)');
            statement.run(`${username}`, `${hash}`);
            statement.finalize();
          });
        });
        res.sendStatus(200);
      }
    });
  });
});

module.exports = { router, requireAuth };
