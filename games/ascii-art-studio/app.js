(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const file = $('file');
  const drop = $('drop');
  const sourceCanvas = document.createElement('canvas');
  const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
  const output = $('output');
  const empty = $('empty');
  const status = $('status');
  let sourceImage = null;
  let sourceLabel = '';
  let sourceUrl = '';
  const ramps = {
    classic: '@%#*+=-:. ',
    blocks: '█▓▒░ ',
    simple: '#*+=:. ',
    binary: '10',
  };

  function useImage(image, label) {
    sourceImage = image;
    sourceLabel = label;
    $('width').dispatchEvent(new Event('input'));
    status.textContent = `${label} loaded locally. Adjust the style controls to refine the text art.`;
    convert();
  }

  function loadFile(selected) {
    if (!selected || !selected.type.startsWith('image/')) {
      status.textContent = 'Please choose a PNG, JPEG, WebP, or GIF image.';
      return;
    }
    if (selected.size > 20 * 1024 * 1024) {
      status.textContent = 'Choose an image smaller than 20 MB for this browser tool.';
      return;
    }
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    sourceUrl = URL.createObjectURL(selected);
    const image = new Image();
    image.onload = () => useImage(image, selected.name);
    image.onerror = () => { status.textContent = 'This image could not be decoded by the browser.'; };
    image.src = sourceUrl;
  }

  function convert() {
    if (!sourceImage) return;
    const columns = Number($('width').value);
    const sourceWidth = sourceImage.naturalWidth || sourceImage.width;
    const sourceHeight = sourceImage.naturalHeight || sourceImage.height;
    const aspect = sourceHeight / sourceWidth;
    const rows = Math.max(1, Math.min(120, Math.round(columns * aspect * 0.48)));
    sourceCanvas.width = columns;
    sourceCanvas.height = rows;
    sourceContext.clearRect(0, 0, columns, rows);
    sourceContext.drawImage(sourceImage, 0, 0, columns, rows);
    const pixels = sourceContext.getImageData(0, 0, columns, rows).data;
    const ramp = ramps[$('charset').value] || ramps.classic;
    const contrast = Number($('contrast').value) / 100;
    const brightness = Number($('brightness').value);
    const invert = $('invert').checked;
    let text = '';
    for (let y = 0; y < rows; y += 1) {
      let line = '';
      for (let x = 0; x < columns; x += 1) {
        const index = (y * columns + x) * 4;
        const alpha = pixels[index + 3] / 255;
        let light = (0.2126 * pixels[index] + 0.7152 * pixels[index + 1] + 0.0722 * pixels[index + 2]) * alpha + 255 * (1 - alpha);
        light = Math.max(0, Math.min(255, (light - 128) * contrast + 128 + brightness));
        if (invert) light = 255 - light;
        const rampIndex = Math.max(0, Math.min(ramp.length - 1, Math.round((1 - light / 255) * (ramp.length - 1))));
        line += ramp[rampIndex];
      }
      text += line + (y === rows - 1 ? '' : '\n');
    }
    output.textContent = text;
    output.hidden = false;
    empty.hidden = true;
    $('dimensions').textContent = `${columns} × ${rows} characters · ${sourceLabel}`;
    $('copy').disabled = false;
    $('download').disabled = false;
    status.textContent = `Converted ${sourceLabel} locally to ${columns} columns.`;
  }

  function drawSample() {
    const canvas = document.createElement('canvas');
    canvas.width = 480; canvas.height = 280;
    const ctx = canvas.getContext('2d');
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#132b3a'); sky.addColorStop(.62, '#64a47f'); sky.addColorStop(1, '#f2d98c');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f4e6a6'; ctx.beginPath(); ctx.arc(360, 82, 42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#386e55'; ctx.beginPath(); ctx.moveTo(0, 220); ctx.lineTo(92, 114); ctx.lineTo(180, 220); ctx.lineTo(280, 105); ctx.lineTo(420, 230); ctx.lineTo(480, 185); ctx.lineTo(480, 280); ctx.lineTo(0, 280); ctx.fill();
    ctx.fillStyle = '#183c31'; ctx.beginPath(); ctx.moveTo(0, 247); ctx.lineTo(120, 175); ctx.lineTo(230, 246); ctx.lineTo(350, 161); ctx.lineTo(480, 237); ctx.lineTo(480, 280); ctx.lineTo(0, 280); ctx.fill();
    ctx.fillStyle = '#d3c184'; ctx.fillRect(0, 255, 480, 25);
    useImage(canvas, 'code-drawn sample');
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    const temp = document.createElement('textarea');
    temp.value = text; temp.style.position = 'fixed'; temp.style.opacity = '0';
    document.body.appendChild(temp); temp.select();
    const copied = document.execCommand('copy'); temp.remove();
    return copied ? Promise.resolve() : Promise.reject(new Error('Clipboard is unavailable'));
  }

  file.addEventListener('change', () => loadFile(file.files && file.files[0]));
  $('sample').addEventListener('click', drawSample);
  for (const id of ['width', 'contrast', 'brightness']) $(id).addEventListener('input', () => {
    $('width-value').textContent = `${$('width').value} columns`;
    $('contrast-value').textContent = `${$('contrast').value}%`;
    $('brightness-value').textContent = $('brightness').value;
    convert();
  });
  for (const id of ['charset', 'invert']) $(id).addEventListener('change', convert);
  $('copy').addEventListener('click', () => copyText(output.textContent).then(() => { status.textContent = 'ASCII art copied to the clipboard.'; }).catch(() => { status.textContent = 'Copy is not available here; select the text to copy it manually.'; }));
  $('download').addEventListener('click', () => {
    const blob = new Blob([output.textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'ascii-art.txt'; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 800);
  });
  for (const eventName of ['dragenter', 'dragover']) drop.addEventListener(eventName, (event) => { event.preventDefault(); drop.classList.add('drag'); });
  for (const eventName of ['dragleave', 'drop']) drop.addEventListener(eventName, (event) => { event.preventDefault(); drop.classList.remove('drag'); });
  drop.addEventListener('drop', (event) => loadFile(event.dataTransfer.files && event.dataTransfer.files[0]));
  $('width-value').textContent = `${$('width').value} columns`;
})();
