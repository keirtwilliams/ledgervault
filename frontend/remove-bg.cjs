const Jimp = require('jimp');

Jimp.read('public/favicon.jpg')
  .then(image => {
    // We want to make white transparent
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];

      // If the pixel is very close to white
      if (red > 220 && green > 220 && blue > 220) {
        // Calculate an alpha value based on how white it is to smooth the edges
        const whiteness = (red + green + blue) / 3;
        const alpha = 255 - Math.max(0, Math.min(255, (whiteness - 220) * (255 / 35)));
        this.bitmap.data[idx + 3] = alpha;
      }
    });

    return image.writeAsync('public/favicon.png');
  })
  .then(() => {
    console.log("Successfully created transparent PNG.");
  })
  .catch(err => {
    console.error(err);
  });
