const express = require('express');

const app = express();
// app.set("view engine", "ejs");

app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));

app.get('/data', (req, res) => {
  const date = new Date();
  let hour = date.getHours();
  let min = date.getMinutes();
  let sec = date.getSeconds();

  if (hour < 10) {
    hour = `0${hour}`;
  }
  if (min < 10) {
    min = `0${min}`;
  }
  if (sec < 10) {
    sec = `0${sec}`;
  }

  const time = `${hour}:${min}:${sec}`;
  const milliseconds = 3000;

  console.log('Waiting 3 seconds');

  return setTimeout(() => res.send(time), milliseconds);
});
