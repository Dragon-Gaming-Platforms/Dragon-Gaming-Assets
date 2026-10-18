let generation = 0;

const PALETTES = {
  ember: [[7, 12, 24], [27, 44, 91], [142, 47, 88], [247, 125, 62], [255, 222, 135]],
  ocean: [[5, 14, 30], [18, 70, 105], [42, 151, 160], [146, 226, 194], [242, 250, 205]],
  orchid: [[12, 9, 28], [72, 35, 104], [183, 63, 139], [244, 139, 178], [248, 225, 193]],
  mono: [[4, 8, 12], [50, 70, 83], [122, 145, 157], [211, 225, 225], [255, 255, 239]],
};

self.onmessage = (event) => {
  const message = event.data;
  if (message.type === 'cancel') {
    generation += 1;
    return;
  }
  if (message.type === 'render') {
    const token = ++generation;
    render(message, token);
  }
};

async function render(job, token) {
  const { requestId, width, height, centerX, centerY, span, mode, juliaX, juliaY, iterations } = job;
  const aspect = width / height;
  const pixels = new Uint8ClampedArray(width * height * 4);
  const stops = PALETTES[job.palette] || PALETTES.ember;
  let y = 0;
  const rowsPerSlice = 6;

  while (y < height && token === generation) {
    const endY = Math.min(height, y + rowsPerSlice);
    for (let py = y; py < endY; py += 1) {
      const imagAtRow = centerY + (0.5 - (py + 0.5) / height) * span;
      for (let px = 0; px < width; px += 1) {
        const realAtPixel = centerX + ((px + 0.5) / width - 0.5) * span * aspect;
        let zr = mode === 'julia' ? realAtPixel : 0;
        let zi = mode === 'julia' ? imagAtRow : 0;
        const cr = mode === 'julia' ? juliaX : realAtPixel;
        const ci = mode === 'julia' ? juliaY : imagAtRow;
        let count = 0;
        let magnitudeSquared = 0;

        while (count < iterations && magnitudeSquared <= 4) {
          const nextReal = zr * zr - zi * zi + cr;
          zi = 2 * zr * zi + ci;
          zr = nextReal;
          magnitudeSquared = zr * zr + zi * zi;
          count += 1;
        }

        const offset = (py * width + px) * 4;
        if (count >= iterations) {
          pixels[offset] = 4;
          pixels[offset + 1] = 8;
          pixels[offset + 2] = 12;
          pixels[offset + 3] = 255;
          continue;
        }

        const magnitude = Math.sqrt(Math.max(magnitudeSquared, 4.000001));
        const smoothCount = count + 1 - Math.log2(Math.log2(magnitude));
        const color = colorAt(stops, smoothCount);
        pixels[offset] = color[0];
        pixels[offset + 1] = color[1];
        pixels[offset + 2] = color[2];
        pixels[offset + 3] = 255;
      }
    }
    y = endY;
    self.postMessage({ type: 'progress', requestId, progress: y / height });
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  if (token === generation) {
    self.postMessage({ type: 'done', requestId, width, height, pixels: pixels.buffer }, [pixels.buffer]);
  }
}

function colorAt(stops, value) {
  const cycle = ((value * 0.026) % 1 + 1) % 1;
  const position = cycle * (stops.length - 1);
  const lower = Math.floor(position);
  const upper = Math.min(stops.length - 1, lower + 1);
  const amount = position - lower;
  const a = stops[lower];
  const b = stops[upper];
  return [
    Math.round(a[0] + (b[0] - a[0]) * amount),
    Math.round(a[1] + (b[1] - a[1]) * amount),
    Math.round(a[2] + (b[2] - a[2]) * amount),
  ];
}
