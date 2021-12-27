const { Router } = require('express');
const db = require('../database');
const { SessionManager } = require('../sessionManager');

const publicRouter = Router();
const privateRouter = Router();


publicRouter.post('/login', (req, res) => {
  console.log(req.get('host'), req.originalUrl, 'Public Router Login');
  const user = req.body;
  console.log(user);

  db.serialize(() => {
    let foundUser = false;
    db.each('SELECT username, password FROM users', (err, row) => {
      if (err) { throw new Error(err); }
      console.log(row.password);
      if (user.username === row.username && user.password === row.password) {
        foundUser = true;
      }
    }, () => {
      if (foundUser === false) {
        res.redirect('/login?statusFail=Bad Credentials');
      } else {
        const session = SessionManager.new();
        res.cookie('session-id', session.id);
        res.cookie('username', user.username).redirect('/profile');
      }
    });
  });
});

publicRouter.post('/register', (req, res) => {
  console.log(req.get('host'), req.originalUrl, 'Public Router Register');
  const regUser = req.body;
  const password = regUser.password[0];
  const copyPassword = regUser.password[1];

  let exists = false;
  db.serialize(() => {
    db.each('SELECT username, password FROM users', (err, row) => {
      if (err) {
        throw new Error(err);
      }
      if (regUser.username === row.username) {
        exists = true;
      }
    }, () => {
      if (exists) {
        res.redirect('/register?statusFail=Account already exists');
      } else if (!/\d/.test(regUser.username)) {
        res.redirect('/register?statusFail=Password must contain at least one digit');
      } else if (!/\d/.test(password)) {
        res.redirect('/register?statusFail=Password must contain at least one digit');
      } else if (regUser.username.length < 5 || password.length < 5 || copyPassword.length < 5) {
        res.redirect('/register?statusFail=Size must be atleast 5');
      } else if (password !== copyPassword) {
        res.redirect("/register?statusFail=Passwords didn't match");
      } else {
        db.serialize(() => {
          const statement = db.prepare('INSERT INTO users (username, password) VALUES (?,?)');
          statement.run(`${regUser.username}`, `${password}`);
          console.log(`${regUser.username}`, `${password}`);
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
