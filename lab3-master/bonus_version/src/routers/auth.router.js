const { Router } = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');
const { SessionManager } = require('../sessionManager');

const publicRouter = Router();
const privateRouter = Router();


publicRouter.post('/login', (req, res) => {
  console.log(req.get('host'), req.originalUrl, 'Public Router Login');
  const user = req.body;
  db.serialize(() => {
    let foundUser = false;
    let hashedPass = '';
    db.each('SELECT username, password FROM users', (err, row) => {
      if (err) { throw new Error(err); }
      if (user.username === row.username) {
        foundUser = true;
        hashedPass = row.password;
      }
    }, () => {
      if (foundUser === false) {
        res.redirect('/login?statusFail=Bad Credentials');
      } else {
        bcrypt.compare(user.password, hashedPass, (err, result) => {
          console.log(hashedPass, 'hashedpass');
          console.log(user.password, 'userpass', result);
          // result == true
          if (result === true) {
            const session = SessionManager.new();
            res.cookie('session-id', session.id, { maxAge: 10000 });
            res.cookie('username', user.username, { maxAge: 10000 }).redirect('/profile');
          } else {
            res.redirect('/login?statusFail=Bad Credentials');
          }
        });
      }
    });
  });
});

publicRouter.post('/register', (req, res) => {
  const saltRounds = 10;
  console.log(req.get('host'), req.originalUrl, 'Public Router Register');
  const regUser = req.body;
  const { username } = regUser;
  const { password } = regUser;
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
        res.redirect('/register?statusFail=Account already exists');
      } else if (!/\d/.test(username)) {
        res.redirect('/register?statusFail=Password must contain at least one digit');
      } else if (!/\d/.test(username)) {
        res.redirect('/register?statusFail=Password must contain at least one digit');
      } else if (username.length < 5 || password[0].length < 5 || password[1].length < 5) {
        res.redirect('/register?statusFail=Size must be atleast 5');
      } else if (password[0] !== password[1]) {
        res.redirect("/register?statusFail=Passwords didn't match");
      } else {
        bcrypt.hash(password[0], saltRounds, (err, hash) => {
          // Store hash in your password DB.
          db.serialize(() => {
            const statement = db.prepare('INSERT INTO users (username, password) VALUES (?,?)');
            statement.run(`${username}`, `${hash}`);
          });
        });
        res.redirect('/login?statusSuccess=New account created');
      }
    });
  });
});

privateRouter.post('/logout', (req, res) => {
  console.log(req.get('host'), req.originalUrl, 'Private Router');
  res.clearCookie('session-id');
  res.clearCookie('username');
  res.redirect('/login?statusSuccess=Successfully logged out!');
});

module.exports = {
  publicRouter, privateRouter,
};
