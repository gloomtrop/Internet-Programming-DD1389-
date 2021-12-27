let board1 = {};
let board2 = {};
let player = { id: 1, text: 'X', color: 'red' };
let winLimit = 4;
let rows;
let cols;

function getLimit() {
  return winLimit;
}

function gameMaker(rs, cs) {
  const element = document.getElementById('playground');
  for (let i = 0; i < rs; i += 1) {
    for (let j = 0; j < cs; j += 1) {
      const tag = document.createElement('button');
      const classText = `row,${i},col,${j}`;

      if (i === (rs - 1)) {
        tag.setAttribute('class', 'valid1 cell');
        tag.style.background = 'darkolivegreen';
        tag.setAttribute('onClick', 'connectFour(this.id)');
        // tag.addEventListener('click', connectFour(this.id))
      } else {
        tag.setAttribute('class', 'cell');
      }

      tag.setAttribute('id', classText);
      element.appendChild(tag);
    }
  }

  const colsTxt = `repeat(${cs.toString()},1fr)`;
  element.style.gridTemplateColumns = colsTxt;
}

function makeGame() {
  const element = document.getElementById('playground');
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  const button = document.getElementById('clicker');
  button.removeAttribute('onclick');
  const numbertxt = document.getElementById('fname').value;
  const numbers = numbertxt.split(',');

  const rowss = parseInt(numbers[0], 10);
  const colss = parseInt(numbers[1], 10);

  if ((rowss >= 3 && colss >= 3)
  && (parseInt(numbers[2], 10) <= rowss && parseInt(numbers[2], 10) <= colss)) {
    rows = parseInt(numbers[0], 10);
    cols = parseInt(numbers[1], 10);
    winLimit = parseInt(numbers[2], 10);
  } else {
    window.alert('That makes no sense! You will have the original size and win limit');
  }
  gameMaker(rows, cols);
}

function restart(color) {
  const txt = `Congrats ${color}, you've won!`;
  window.alert(txt);

  if (window.confirm('Do you want to play again?')) {
    board1 = {};
    board2 = {};
    player = { id: 1, text: 'X', color: 'red' };
    const element = document.getElementById('playground');
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
    const button = document.getElementById('clicker');
    button.addEventListener('click', makeGame);
  } else {
    const element = document.getElementById('playground');
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
}

function checkWin(id, board) {
  let win = false;

  function alterWin() {
    win = true;
  }
  const idList = id.split(',');
  const row = parseInt(idList[1], 10);
  const col = parseInt(idList[3], 10);
  const brd = board;
  brd[id] = {};
  for (let i = -1; i < 2; i += 1) {
    for (let j = -1; j < 2; j += 1) {
      brd[id][`${i},${j}`] = 1;
    }
  }
  for (let i = -1; i < 2; i += 1) {
    for (let j = -1; j < 2; j += 1) {
      const nextRow = row + i;
      const nextCol = col + j;
      const key = `row,${nextRow},col,${nextCol}`;
      if (key in brd && id !== key) {
        const keyD = brd[key];
        const rowIdx = row - nextRow;
        const colIdx = col - nextCol;
        const idx = `${rowIdx},${colIdx}`;

        let condition = false;
        Object.keys(keyD).forEach((index) => {
          if (condition === false) {
            if (index === idx) {
              const val = keyD[index];
              brd[id][index] = val + 1;
              if (val + 1 === getLimit()) {
                alterWin();
                condition = true;
              }
            }
          }
        });
      }
    }
  }
  return [win, brd];
}

function connectFour(thisId) {
  if (thisId === '') {
    return;
  }
  let win;
  let row = ''; let col = '';
  const listId = thisId.split(',');
  row = parseInt(listId[1], 10) - 1;
  col = parseInt(listId[3], 10);

  let nextCell;
  if (row >= 0) {
    const nextId = `row,${row},col,${col}`;
    nextCell = document.getElementById(nextId);

    nextCell.setAttribute('onClick', 'connectFour(this.id)');
  }

  const cell = document.getElementById(thisId);
  if (player.id === 1) {
    [win, board1] = checkWin(thisId, board1);

    if (win === true) {
      restart('red');
    } else {
      cell.classList.remove('valid1');
      cell.removeAttribute('onclick');
      const validCells = document.querySelectorAll('.valid1');

      for (let i = 0; i < validCells.length; i += 1) {
        validCells[i].classList.remove('valid1');
        validCells[i].classList.add('valid2');
      }
      if (row >= 0) {
        nextCell.classList.add('valid2');
      }

      document.getElementById(thisId).style.background = 'red';
      player.color = 'yellow';
      player.id = 2;
    }
  } else {
    [win, board2] = checkWin(thisId, board2);
    if (win === true) {
      restart('yellow');
    } else {
      cell.classList.remove('valid2');
      cell.removeAttribute('onclick');
      const validCells = document.querySelectorAll('.valid2');

      for (let i = 0; i < validCells.length; i += 1) {
        validCells[i].classList.remove('valid2');
        validCells[i].classList.add('valid1');
      }
      if (row >= 0) {
        nextCell.classList.add('valid1');
      }
      document.getElementById(thisId).style.background = 'yellow';
      player.color = 'red';
      player.id = 1;
    }
  }
}
connectFour('');
