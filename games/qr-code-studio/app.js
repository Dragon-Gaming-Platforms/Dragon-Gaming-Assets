(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const canvas = $('qr');
  const ctx = canvas.getContext('2d');
  let currentQr = null;
  let renderTimer = 0;

  function render() {
    const text = $('content').value;
    $('length').textContent = `${text.length} characters`;
    $('cell-output').textContent = `${$('cell').value} px`;
    $('margin-output').textContent = `${$('margin').value} modules`;
    if (!text.trim()) {
      currentQr = null;
      canvas.width = 1; canvas.height = 1;
      ctx.clearRect(0, 0, 1, 1);
      $('version').textContent = 'QR version —';
      $('dimensions').textContent = '— × — modules';
      $('status').textContent = 'Enter text to generate a code.';
      return;
    }
    try {
      const qr = qrcode(0, $('correction').value);
      qr.addData(text, 'Byte');
      qr.make();
      currentQr = qr;
      draw(qr);
      const count = qr.getModuleCount();
      $('version').textContent = `QR version ${Math.round((count - 17) / 4)}`;
      $('dimensions').textContent = `${count} × ${count} modules`;
      $('status').textContent = `Generated locally · ${count} modules · ${text.length} characters`;
    } catch (error) {
      currentQr = null;
      canvas.width = 1; canvas.height = 1;
      ctx.clearRect(0, 0, 1, 1);
      $('version').textContent = 'QR version —';
      $('dimensions').textContent = '— × — modules';
      $('status').textContent = `Could not encode this content: ${error.message || 'payload too large'}`;
    }
  }

  function draw(qr) {
    const modules = qr.getModuleCount();
    const quiet = Number($('margin').value);
    const cellSize = Number($('cell').value);
    const size = (modules + quiet * 2) * cellSize;
    canvas.width = size;
    canvas.height = size;
    const paper = $('paper').value;
    const ink = $('ink').value;
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = ink;
    for (let row = 0; row < modules; row += 1) {
      for (let col = 0; col < modules; col += 1) {
        if (qr.isDark(row, col)) ctx.fillRect((col + quiet) * cellSize, (row + quiet) * cellSize, cellSize, cellSize);
      }
    }
  }

  function svgSource(qr) {
    const modules = qr.getModuleCount();
    const quiet = Number($('margin').value);
    const viewSize = modules + quiet * 2;
    let path = '';
    for (let row = 0; row < modules; row += 1) {
      for (let col = 0; col < modules; col += 1) {
        if (qr.isDark(row, col)) path += `M${col + quiet} ${row + quiet}h1v1h-1z`;
      }
    }
    const ink = $('ink').value;
    const paper = $('paper').value;
    const pixelSize = viewSize * Number($('cell').value);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelSize}" height="${pixelSize}" viewBox="0 0 ${viewSize} ${viewSize}" shape-rendering="crispEdges"><rect width="${viewSize}" height="${viewSize}" fill="${paper}"/><path d="${path}" fill="${ink}"/></svg>`;
  }

  function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = filename; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  for (const id of ['content', 'correction', 'cell', 'margin', 'ink', 'paper']) {
    $(id).addEventListener('input', () => {
      window.clearTimeout(renderTimer);
      renderTimer = window.setTimeout(render, 100);
    });
    $(id).addEventListener('change', render);
  }
  $('png').addEventListener('click', () => {
    if (!currentQr) return;
    canvas.toBlob((blob) => { if (blob) saveBlob(blob, 'qr-code.png'); }, 'image/png');
  });
  $('svg').addEventListener('click', () => {
    if (!currentQr) return;
    saveBlob(new Blob([svgSource(currentQr)], { type: 'image/svg+xml;charset=utf-8' }), 'qr-code.svg');
  });
  $('copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('content').value);
      $('status').textContent = 'Encoded text copied. The QR image itself remains local.';
    } catch (_error) {
      $('content').focus(); $('content').select();
      $('status').textContent = 'Select and copy the content from the text box.';
    }
  });
  render();
})();
