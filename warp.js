const createWarpedImage = () => {
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
