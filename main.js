// DOM Elements
const originalImg = document.getElementById('img');
const warpedImg = document.getElementById('warpedImg');
const warpButton = document.getElementById('warpButton');
const resetButton = document.getElementById('resetButton');
const dotCursor = document.getElementById('dotCursor');
const spinner = document.getElementById('spinner');
const dots = [];

let corners = [];

const appendLine = (dot, coordOne, coordTwo) => {
  const line = document.createElement('div');
  line.setAttribute('class', 'line');

  const width =
    Math.sqrt((coordOne.x - coordTwo.x) ** 2 + (coordOne.y - coordTwo.y) ** 2) +
    10;

  line.style.width = `${width}px`;

  let rotation = math.atan(
    (coordOne.y - coordTwo.y) / (coordOne.x - coordTwo.x)
  );
  rotation += coordOne.x < coordTwo.x ? 0 : Math.PI;

  dot.style.transformOrigin = 'center center';
  dot.style.transform = `rotate(${rotation}rad)`;

  dot.appendChild(line);
};

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

  if (corners.length > 1) {
    const previousCoords = corners[corners.length - 2];
    const previousDot = dots[dots.length - 2];
    appendLine(previousDot, previousCoords, dotCoords);
  }

  if (corners.length === 4) {
    appendLine(dot, dotCoords, corners[0]);
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
