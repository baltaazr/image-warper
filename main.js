// DOM Elements
const originalImg = document.getElementById('img');
const warpedImg = document.getElementById('warpedImg');
const warpButton = document.getElementById('warpButton');
const resetButton = document.getElementById('resetButton');
const dotCursor = document.getElementById('dotCursor');
const dots = [];

let corners = [];

originalImg.addEventListener('mousemove', (e) => {
  dotCursor.style.top = `${e.pageY}px`;
  dotCursor.style.left = `${e.pageX}px`;
});

originalImg.addEventListener('click', (e) => {
  if (corners.length === 4) return;
  const dotCoords = { x: e.pageX, y: e.pageY };
  corners.push(dotCoords);

  const dot = document.createElement('div');
  dot.setAttribute('class', 'dot');
  dot.style.top = `${dotCoords.y}px`;
  dot.style.left = `${dotCoords.x}px`;
  dots.push(dot);

  document.body.appendChild(dot);

  if (corners.length === 4) {
    dotCursor.style.backgroundColor = 'transparent';
    warpButton.disabled = false;
  }
});

const reset = () => {
  for (let idx = 0; idx < dots.length; idx++) {
    const dot = dots[idx];
    dot.remove();
  }

  corners = [];

  warpButton.disabled = true;
  dotCursor.style.backgroundColor = 'rgba(255,0,0,0.5)';
};

resetButton.addEventListener('click', reset);
