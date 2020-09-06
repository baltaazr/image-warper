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

  return { topLeft, topRight, botLeft, botRight };
};

const getNormalizedCorners = () => {
  const positionedCorners = getPositionedCorners();

  let { topLeft, topRight, botLeft, botRight } = positionedCorners;
  const width = botRight.x - topLeft.x;
  const height = botRight.y - topLeft.y;

  topRight = {
    x: (topRight.x - topLeft.x) / width,
    y: (topRight.y - topLeft.y) / height
  };
  botLeft = {
    x: (botLeft.x - topLeft.x) / width,
    y: (botLeft.y - topLeft.y) / height
  };

  return {
    topLeft: { x: 0, y: 0 },
    topRight,
    botLeft,
    botRight: { x: 1, y: 1 }
  };
};

const getProjMat = () => {
  const {
    topLeft: { x: x0, y: y0 },
    topRight: { x: x1, y: y1 },
    botRight: { x: x2, y: y2 },
    botLeft: { x: x3, y: y3 }
  } = getNormalizedCorners();

  const u0 = 0,
    v0 = 0,
    u1 = 1,
    v1 = 0,
    u2 = 1,
    v2 = 1,
    u3 = 0,
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
  const i = 1;

  const projMat = [
    [e * i - f * h, c * h - b * i, b * f - c * e],
    [f * g - d * i, a * i - c * g, c * d - a * f],
    [d * h - e * g, b * g - a * h, a * e - b * d]
  ];

  return projMat;
};

const createWarpedImage = () => {
  const projMat = getProjMat();

  const width = originalImg.offsetWidth,
    height = originalImg.offsetHeight,
    buffer = new Uint8ClampedArray(width * height * 4); // have enough bytes

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = (y * width + x) * 4; // position in buffer based on x and y
      buffer[pos] = 255; // some R value [0, 255]
      buffer[pos + 1] = 0; // some G value
      buffer[pos + 2] = 0; // some B value
      buffer[pos + 3] = 255; // set alpha channel
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
};

warpButton.addEventListener('click', createWarpedImage);
