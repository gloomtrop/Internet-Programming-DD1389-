const path = require('path'); //  Helps resolve relative paths, into absolute paths, independent of operating system
const { Database } = require('sqlite3').verbose();

const databasePath = path.join(__dirname, '..', 'db.sqlite');
const db = new Database(databasePath);

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS users');
  db.run('CREATE TABLE users (username TEXT, password TEXT)');

  const statement = db.prepare('INSERT INTO users (username, password) VALUES (?,?)');
  for (let i = 0; i < 10; i += 1) {
    statement.run(`Ipsum ${i}`, `${i}`);
  }
  statement.finalize();
});

module.exports = db;
