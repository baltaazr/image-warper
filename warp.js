let startingPos = { x: 0, y: 0 };
let width = 0;
let height = 0;

const getPositionedCorners = () => {
  const topLeft = corners.reduce((prev, current) => {
    return prev.x + prev.y < current.x + current.y ? prev : current;
  });
  const botRight = corners.reduce((prev, current) => {
    return prev.x + prev.y > current.x + current.y ? prev : current;
  });
  const remainingDots = corners.filter(
    (coords) => coords !== topLeft && coords !== botRight
  );
  const topRight =
    remainingDots[0].y < remainingDots[1].y
      ? remainingDots.splice(0, 1)[0]
      : remainingDots.splice(1, 1)[0];
  const botLeft = remainingDots[0];

  startingPos = { x: topLeft.x, y: topLeft.y };

  return { topLeft, topRight, botLeft, botRight };
};

const getNormalizedCorners = () => {
  const positionedCorners = getPositionedCorners();

  let { topLeft, topRight, botLeft, botRight } = positionedCorners;
  width = Math.round(
    (Math.sqrt((topLeft.x - topRight.x) ** 2 + (topLeft.y - topRight.y) ** 2) +
      Math.sqrt(
        (botLeft.x - botRight.x) ** 2 + (botLeft.y - botRight.y) ** 2
      )) /
      2
  );
  height = Math.round(
    (Math.sqrt((topLeft.x - botLeft.x) ** 2 + (topLeft.y - botLeft.y) ** 2) +
      Math.sqrt(
        (topRight.x - botRight.x) ** 2 + (topRight.y - botRight.y) ** 2
      )) /
      2
  );

  topRight = {
    x: (topRight.x - topLeft.x) / width,
    y: (topRight.y - topLeft.y) / height
  };
  botLeft = {
    x: (botLeft.x - topLeft.x) / width,
    y: (botLeft.y - topLeft.y) / height
  };
  botRight = {
    x: (botRight.x - topLeft.x) / width,
    y: (botRight.y - topLeft.y) / height
  };

  return {
    topLeft: { x: 0, y: 0 },
    topRight,
    botLeft,
    botRight
  };
};

const getM = () => {
  const {
    topLeft: { x: x0, y: y0 },
    topRight: { x: x1, y: y1 },
    botRight: { x: x2, y: y2 },
    botLeft: { x: x3, y: y3 }
  } = getNormalizedCorners();

  const u0 = 0,
    u1 = 1,
    u2 = 1,
    u3 = 0,
    v0 = 0,
    v1 = 0,
    v2 = 1,
    v3 = 1;

  const A = [
    [u0, v0, 1, 0, 0, 0, -u0 * x0, -v0 * x0],
    [u1, v1, 1, 0, 0, 0, -u1 * x1, -v1 * x1],
    [u2, v2, 1, 0, 0, 0, -u2 * x2, -v2 * x2],
    [u3, v3, 1, 0, 0, 0, -u3 * x3, -v3 * x3],
    [0, 0, 0, u0, v0, 1, -u0 * y0, -v0 * y0],
    [0, 0, 0, u1, v1, 1, -u1 * y1, -v1 * y1],
    [0, 0, 0, u2, v2, 1, -u2 * y2, -v2 * y2],
    [0, 0, 0, u3, v3, 1, -u3 * y3, -v3 * y3]
  ];

  const invA = math.inv(A);
  const aToH = math.multiply(invA, [
    [x0],
    [x1],
    [x2],
    [x3],
    [y0],
    [y1],
    [y2],
    [y3]
  ]);

  const [[a], [b], [c], [d], [e], [f], [g], [h]] = aToH;

  const M = [
    [a, b, c],
    [d, e, f],
    [g, h, 1]
  ];

  return M;
};

const createWarpedImage = () => {
  const M = getM();

  const { width: imgWidth, height: imgHeight } = originalImg;

  const originalImgCanvas = document.createElement('canvas');
  originalImgCanvas.width = imgWidth;
  originalImgCanvas.height = imgHeight;
  originalImgCanvas
    .getContext('2d')
    .drawImage(originalImg, 0, 0, imgWidth, imgHeight);

  const buffer = new Uint8ClampedArray(width * height * 4); // have enough bytes

  for (let v = 0; v < height; v++) {
    for (let u = 0; u < width; u++) {
      let [[x], [y], [w]] = math.multiply(M, [[u / width], [v / height], [1]]);

      x /= w;
      x *= width;
      x += startingPos.x;

      y /= w;
      y *= height;
      y += startingPos.y;

      const pixelData = originalImgCanvas
        .getContext('2d')
        .getImageData(Math.round(x), Math.round(y), 1, 1).data;

      const pos = (v * width + u) * 4; // position in buffer based on x and y
      buffer[pos] = pixelData[0]; // some R value [0, 255]
      buffer[pos + 1] = pixelData[1]; // some G value
      buffer[pos + 2] = pixelData[2]; // some B value
      buffer[pos + 3] = pixelData[3]; // set alpha channel
    }
  }

  // create off-screen canvas element
  const ctx = warpedImg.getContext('2d');

  warpedImg.width = width;
  warpedImg.height = height;

  // create imageData object
  const idata = ctx.createImageData(width, height);

  // set our buffer as source
  idata.data.set(buffer);

  // update canvas with new data
  ctx.putImageData(idata, 0, 0);

  spinner.style.display = 'none';
};

warpButton.addEventListener('click', () => {
  spinner.style.display = 'inline-block';
  setTimeout(createWarpedImage, 1000);
});
