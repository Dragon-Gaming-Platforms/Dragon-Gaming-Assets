(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const editor = $('code');
  const frame = $('preview');
  const consoleBox = $('console');
  let runToken = 0;
  const snippets = {
    hello: `// Use console.log() and the isolated preview DOM.\nconst title = document.createElement('h1');\ntitle.textContent = 'Hello from the sandbox!';\ntitle.style.cssText = 'font: 700 28px system-ui; color: #4361ee;';\ndocument.body.append(title);\nconsole.log('The code is running inside an isolated iframe.');\nconsole.log({ answer: 42, local: true });`,
    loops: `// A tiny FizzBuzz example.\nfor (let n = 1; n <= 20; n += 1) {\n  const label = n % 15 === 0 ? 'FizzBuzz'\n    : n % 3 === 0 ? 'Fizz'\n    : n % 5 === 0 ? 'Buzz' : n;\n  console.log(label);\n}`,
    canvas: `// Draw a small pattern in the sandboxed DOM.\nconst canvas = document.createElement('canvas');\ncanvas.width = 420;\ncanvas.height = 220;\ncanvas.style.cssText = 'max-width: 100%; border-radius: 12px;';\ndocument.body.append(canvas);\nconst ctx = canvas.getContext('2d');\nconst gradient = ctx.createLinearGradient(0, 0, 420, 220);\ngradient.addColorStop(0, '#3730a3');\ngradient.addColorStop(1, '#14b8a6');\nctx.fillStyle = gradient;\nctx.fillRect(0, 0, 420, 220);\nctx.fillStyle = '#fff';\nfor (let i = 0; i < 12; i += 1) {\n  ctx.beginPath();\n  ctx.arc(35 + i * 32, 110 + Math.sin(i * 0.8) * 44, 8 + (i % 3) * 4, 0, Math.PI * 2);\n  ctx.fill();\n}\nconsole.log('Canvas rendered locally.');`,
  };

  function stringify(value) {
    if (typeof value === 'string') return value;
    try {
      const json = JSON.stringify(value, null, 2);
      return json === undefined ? String(value) : json;
    } catch (_error) { return String(value); }
  }

  function appendLog(kind, text) {
    const blank = consoleBox.querySelector('.empty');
    if (blank) blank.remove();
    const row = document.createElement('div');
    row.className = `log-row ${['info', 'warn', 'error', 'result', 'system'].includes(kind) ? kind : 'info'}`;
    row.textContent = String(text).slice(0, 5000);
    consoleBox.appendChild(row);
    while (consoleBox.children.length > 300) consoleBox.firstElementChild.remove();
    consoleBox.scrollTop = consoleBox.scrollHeight;
  }

  function buildSrcdoc(source, token) {
    const encodedCode = JSON.stringify(source).replace(/</g, '\\u003c');
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; font-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'; navigate-to 'none'"><style>body{margin:16px;font:14px/1.5 system-ui,-apple-system,sans-serif;color:#202334}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style></head><body><script>(()=>{\nconst token=${token};\nconst send=(kind,text)=>{try{parent.postMessage({channel:'js-playground',token,kind,text:String(text)},'*')}catch(_){}};\nconst inspect=(value)=>{if(typeof value==='string')return value;try{const out=JSON.stringify(value,null,2);return out===undefined?String(value):out}catch(_){return String(value)}};\nconst localConsole={log:(...args)=>send('info',args.map(inspect).join(' ')),info:(...args)=>send('info',args.map(inspect).join(' ')),debug:(...args)=>send('info',args.map(inspect).join(' ')),warn:(...args)=>send('warn',args.map(inspect).join(' ')),error:(...args)=>send('error',args.map(inspect).join(' ')),clear:()=>send('clear','Console cleared from sandbox')};\nwindow.console=localConsole;\nwindow.addEventListener('error',(event)=>send('error',event.message+' ('+event.lineno+':'+event.colno+')'));\nwindow.addEventListener('unhandledrejection',(event)=>send('error','Unhandled promise rejection: '+inspect(event.reason)));\nconst code=${encodedCode};\n(async()=>{try{const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;const fn=new AsyncFunction('console','document','window',code);const result=await fn(localConsole,document,window);if(result!==undefined)send('result',inspect(result));send('done','Run complete.')}catch(error){send('error',error&&error.stack?error.stack:String(error));send('done','Run ended with an error.')}})();\n})();</script></body></html>`;
  }

  function run() {
    runToken += 1;
    const token = runToken;
    consoleBox.replaceChildren();
    $('run-label').textContent = `Run ${token}`;
    $('status').textContent = 'Executing in the isolated iframe. External resources and network connections are blocked by Content Security Policy.';
    appendLog('system', `Starting run ${token} in a fresh sandbox.`);
    frame.srcdoc = buildSrcdoc(editor.value, token);
  }

  window.addEventListener('message', (event) => {
    if (event.source !== frame.contentWindow || !event.data || event.data.channel !== 'js-playground' || event.data.token !== runToken) return;
    if (event.data.kind === 'clear') { consoleBox.replaceChildren(); appendLog('system', event.data.text); return; }
    if (event.data.kind === 'done') { $('status').textContent = event.data.text; return; }
    appendLog(event.data.kind, event.data.text);
  });

  function updateLineCount() {
    const lines = editor.value.split('\n').length;
    $('line-count').textContent = `${lines} ${lines === 1 ? 'line' : 'lines'}`;
  }

  $('run').addEventListener('click', run);
  $('clear').addEventListener('click', () => { consoleBox.replaceChildren(); appendLog('system', 'Console cleared.'); });
  $('download').addEventListener('click', () => {
    const blob = new Blob([editor.value], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'playground.js'; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 800);
  });
  $('load-snippet').addEventListener('click', () => { editor.value = snippets[$('snippet').value] || snippets.hello; updateLineCount(); });
  editor.addEventListener('input', updateLineCount);
  editor.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.setRangeText('  ', start, end, 'end');
      updateLineCount();
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); run(); }
  });
  editor.value = snippets.hello;
  updateLineCount();
  frame.srcdoc = '<!doctype html><html><body style="font:13px system-ui;color:#667085;padding:16px">Run your code to show its DOM preview here.</body></html>';
})();
