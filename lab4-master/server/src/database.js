const path = require('path'); //  Helps resolve relative paths, into absolute paths, independent of operating system
const { Database } = require('sqlite3').verbose();

const databasePath = path.join(__dirname, '..', 'db.sqlite');
const db = new Database(databasePath);

module.exports = db;
