'use strict';

const clicked = target => () => {
  console.log(`You clicked on ${target.innerHTML}`);
};

const buttons = document.querySelectorAll('.my_button');

buttons.forEach((button) => {
  button.addEventListener('click', clicked(button));
});
