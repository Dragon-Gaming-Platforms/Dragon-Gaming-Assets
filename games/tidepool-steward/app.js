(() => {
  'use strict';

  const MAX_WEEKS = 12;
  const ACTIONS_PER_WEEK = 2;
  const MAP_ROWS = ['RRPSRRSS', 'RSRPSRRS', 'RRSSPRRS', 'SRRPRSSR', 'RSPRRSSR'];
  const SPECIES = [
    { key: 'kelp', name: 'Kelp canopy', role: 'primary producer', color: '#7bd7bd' },
    { key: 'mussels', name: 'Mussels', role: 'filter feeders', color: '#b8d7a8' },
    { key: 'grazers', name: 'Small grazers', role: 'shrimp & snails', color: '#f0cf82' },
    { key: 'fish', name: 'Juvenile fish', role: 'nursery users', color: '#8bd2df' },
    { key: 'crabs', name: 'Rock crabs', role: 'mobile predators', color: '#ff9b85' },
    { key: 'birds', name: 'Shorebirds', role: 'upper food web', color: '#d1b5f5' },
  ];
  const HABITAT = {
    R: { name: 'Rock', icon: '▰', kind: 'rock' },
    S: { name: 'Sand', icon: '·', kind: 'sand' },
    P: { name: 'Pool', icon: '◉', kind: 'pool' },
  };
  const FEATURE = { kelp: '🌿', eelgrass: '〰' };
  const $ = (id) => document.getElementById(id);
  const els = {
    grid: $('habitat-grid'),
    week: $('week-value'),
    tide: $('tide-value'),
    forecast: $('forecast-value'),
    biodiversity: $('biodiversity-value'),
    biodiversityFill: $('biodiversity-fill'),
    clarity: $('clarity-value'),
    clarityFill: $('clarity-fill'),
    temperature: $('temperature-value'),
    actions: $('actions-value'),
    actionChip: $('action-chip'),
    habitatSummary: $('habitat-summary'),
    selection: $('selection-info'),
    species: $('species-list'),
    log: $('event-log'),
    message: $('status-message'),
    advance: $('advance-week'),
    restart: $('restart-season'),
  };
  const actionButtons = [...document.querySelectorAll('[data-action]')];
  let game = makeGame();
  const tileButtons = makeMapButtons();

  function makeGame() {
    const rng = makeRng(0x51ea7e);
    const cells = MAP_ROWS.join('').split('').map((symbol) => ({ habitat: HABITAT[symbol].kind, feature: null, debris: false, reserve: false }));
    [0, 4, 13, 25, 35].forEach((index) => { cells[index].feature = 'kelp'; });
    [6, 9, 15, 18, 23, 24, 29, 33, 37].forEach((index) => { cells[index].feature = 'eelgrass'; });
    [7, 14, 22, 30].forEach((index) => { cells[index].debris = true; });
    [2, 20, 26].forEach((index) => { cells[index].reserve = true; });
    const conditions = makeForecast(1, rng);
    return {
      week: 1,
      actions: ACTIONS_PER_WEEK,
      status: 'active',
      cells,
      selected: null,
      populations: { kelp: 52, mussels: 45, grazers: 42, fish: 33, crabs: 32, birds: 24 },
      previous: null,
      clarity: 74,
      conditions,
      rng,
      log: ['Week 1: A new season begins. The reserve has four debris patches to clear.'],
      message: 'Select a tile, then choose a restoration action. You can also advance early.',
    };
  }

  function makeRng(seed) {
    let value = seed >>> 0;
    return () => {
      value = (1664525 * value + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function makeForecast(week, rng) {
    const seasonal = Math.sin(((week - 1) / (MAX_WEEKS - 1)) * Math.PI);
    const temperature = clamp(13 + seasonal * 7 + (rng() - 0.5) * 2.2, 8, 24);
    const runoff = [4, 8, 11].includes(week);
    const storm = rng() < 0.18;
    const tide = week % 2 === 0 ? 'Spring tide' : 'Neap tide';
    const notes = [];
    if (runoff) notes.push('rain pulse brings sediment');
    if (storm) notes.push('a gusty swell is forecast');
    if (temperature >= 19) notes.push('warm-water stress is rising');
    if (!notes.length) notes.push('calm water, steady growth');
    return { temperature, runoff, storm, tide, note: notes.join(' · ') };
  }

  function makeMapButtons() {
    const buttons = [];
    MAP_ROWS.join('').split('').forEach((_symbol, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tile';
      button.dataset.index = String(index);
      button.addEventListener('click', () => selectTile(index));
      els.grid.appendChild(button);
      buttons.push(button);
    });
    return buttons;
  }

  function coordinate(index) {
    const column = String.fromCharCode(65 + (index % 8));
    const row = Math.floor(index / 8) + 1;
    return `${column}${row}`;
  }

  function counts() {
    const total = { rock: 0, sand: 0, pool: 0, kelp: 0, eelgrass: 0, debris: 0, reserve: 0 };
    for (const cell of game.cells) {
      total[cell.habitat] += 1;
      if (cell.feature) total[cell.feature] += 1;
      if (cell.debris) total.debris += 1;
      if (cell.reserve) total.reserve += 1;
    }
    return total;
  }

  function habitatScore() {
    const count = counts();
    return clamp(29 + count.kelp * 3.2 + count.eelgrass * 2.2 + count.pool * 1.7 + count.reserve * 1.3 - count.debris * 2.1, 0, 100);
  }

  function biodiversity() {
    const values = SPECIES.map(({ key }) => game.populations[key]);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.round(clamp(mean * 0.8 + habitatScore() * 0.2, 0, 100));
  }

  function makeSpeciesRows() {
    els.species.replaceChildren();
    for (const species of SPECIES) {
      const row = document.createElement('div');
      row.className = 'species-row';
      row.innerHTML = `<div class="species-name">${species.name}<span class="species-role">${species.role}</span></div><div class="species-bar" role="meter" aria-label="${species.name} population index" aria-valuemin="0" aria-valuemax="100"><i></i></div><span class="species-value">0</span><span class="species-delta">Baseline</span>`;
      row.dataset.species = species.key;
      row.querySelector('.species-bar i').style.background = `linear-gradient(90deg, ${species.color}88, ${species.color})`;
      els.species.appendChild(row);
    }
  }

  function renderGrid() {
    game.cells.forEach((cell, index) => {
      const button = tileButtons[index];
      const info = Object.values(HABITAT).find((entry) => entry.kind === cell.habitat);
      const id = coordinate(index);
      const featureName = cell.feature === 'kelp' ? 'kelp' : cell.feature === 'eelgrass' ? 'eelgrass' : '';
      const status = [info.name.toLowerCase(), featureName, cell.debris ? 'debris' : '', cell.reserve ? 'protected' : ''].filter(Boolean).join(', ');
      button.dataset.habitat = cell.habitat;
      button.classList.toggle('selected', game.selected === index);
      button.classList.toggle('debris', cell.debris);
      button.setAttribute('aria-label', `${id}, ${status || 'open habitat'}. Select tile.`);
      button.setAttribute('aria-pressed', String(game.selected === index));
      const mark = cell.reserve ? '✦' : cell.debris ? '▧' : '';
      const icon = cell.debris ? '▧' : cell.feature ? FEATURE[cell.feature] : info.icon;
      const label = cell.debris ? 'Debris' : cell.feature === 'eelgrass' ? 'Eelgrass' : cell.feature === 'kelp' ? 'Kelp' : info.name;
      button.innerHTML = `<span class="tile-top"><span class="tile-coordinate">${id}</span><span class="tile-mark">${mark}</span></span><span class="tile-icon" aria-hidden="true">${icon}</span><span class="tile-name">${label}</span>`;
    });
    const count = counts();
    els.habitatSummary.textContent = `${count.kelp} kelp · ${count.eelgrass} grass · ${count.debris} debris`;
  }

  function renderSpecies() {
    for (const species of SPECIES) {
      const row = els.species.querySelector(`[data-species="${species.key}"]`);
      const value = game.populations[species.key];
      const bar = row.querySelector('.species-bar');
      const delta = game.previous ? value - game.previous[species.key] : null;
      row.querySelector('.species-value').textContent = String(Math.round(value));
      bar.setAttribute('aria-valuenow', String(Math.round(value)));
      bar.querySelector('i').style.width = `${clamp(value, 0, 100)}%`;
      row.querySelector('.species-delta').textContent = delta === null ? 'Starting index' : `${delta >= 0 ? '▲' : '▼'} ${Math.abs(Math.round(delta))} this week`;
    }
  }

  function canAct(action, cell) {
    if (!cell || game.status !== 'active' || game.actions <= 0) return false;
    if (action === 'kelp') return ['rock', 'pool'].includes(cell.habitat) && !cell.feature && !cell.debris;
    if (action === 'eelgrass') return cell.habitat === 'sand' && !cell.feature && !cell.debris;
    if (action === 'clean') return cell.debris;
    if (action === 'reserve') return !cell.reserve && !cell.debris;
    return false;
  }

  function render() {
    const count = counts();
    const score = biodiversity();
    const cell = game.selected === null ? null : game.cells[game.selected];
    const climate = game.conditions;
    els.week.textContent = `${String(game.week).padStart(2, '0')} / ${MAX_WEEKS}`;
    els.tide.textContent = climate.tide;
    els.forecast.textContent = climate.note;
    els.biodiversity.textContent = String(score);
    els.biodiversityFill.style.width = `${score}%`;
    els.clarity.textContent = String(Math.round(game.clarity));
    els.clarityFill.style.width = `${game.clarity}%`;
    els.temperature.textContent = climate.temperature.toFixed(1);
    els.actions.textContent = `${game.actions} stewardship action${game.actions === 1 ? '' : 's'} remain`;
    els.actionChip.textContent = `${game.actions} LEFT`;
    els.selection.innerHTML = cell
      ? `<strong>${coordinate(game.selected)}</strong> · ${cell.habitat} habitat · ${cell.feature ? cell.feature : 'open ground'}${cell.debris ? ' · debris' : ''}${cell.reserve ? ' · protected' : ''}`
      : 'Select a habitat tile to begin.';
    actionButtons.forEach((button) => { button.disabled = !canAct(button.dataset.action, cell); });
    if (game.week === MAX_WEEKS) {
      els.advance.textContent = 'Finish the season';
    } else {
      els.advance.textContent = `Advance to week ${game.week + 1}`;
    }
    els.advance.disabled = game.status !== 'active';
    els.restart.disabled = false;
    els.message.textContent = game.message;
    renderGrid();
    renderSpecies();
    els.log.replaceChildren();
    game.log.forEach((entry) => {
      const item = document.createElement('li');
      item.textContent = entry;
      els.log.appendChild(item);
    });
  }

  function say(message) {
    game.message = message;
    els.message.textContent = message;
  }

  function addLog(message) {
    game.log.unshift(message);
    game.log = game.log.slice(0, 6);
  }

  function selectTile(index) {
    game.selected = index;
    const cell = game.cells[index];
    const status = cell.debris ? 'debris is blocking restoration' : cell.feature ? `already supports ${cell.feature}` : 'ready for restoration';
    say(`${coordinate(index)} selected · ${cell.habitat} habitat · ${status}.`);
    render();
    tileButtons[index].focus({ preventScroll: true });
  }

  function applyAction(action) {
    const index = game.selected;
    const cell = index === null ? null : game.cells[index];
    if (!canAct(action, cell)) return;
    let detail = '';
    if (action === 'kelp') { cell.feature = 'kelp'; detail = 'Young kelp now anchors a cool-water canopy.'; }
    if (action === 'eelgrass') { cell.feature = 'eelgrass'; detail = 'Eelgrass roots shelter nursery life and steady the sand.'; }
    if (action === 'clean') { cell.debris = false; detail = 'The litter is removed; the patch can breathe again.'; }
    if (action === 'reserve') { cell.reserve = true; detail = 'This patch is marked as a low-disturbance refuge.'; }
    game.actions -= 1;
    game.message = `${coordinate(index)} restored. ${detail}`;
    addLog(`Week ${game.week} · ${game.message}`);
    render();
  }

  function simulateWeek() {
    const count = counts();
    const climate = game.conditions;
    const previous = { ...game.populations };
    const heat = Math.max(0, climate.temperature - 17.5);
    const clarityShift = -0.35 + count.eelgrass * 0.12 + count.reserve * 0.08 - count.debris * 0.22 - (climate.runoff ? 6 : 0) - (climate.storm ? 4 : 0) + (game.rng() - 0.5) * 1.4;
    game.clarity = clamp(game.clarity + clarityShift, 18, 96);

    const kelpCap = clamp(20 + count.kelp * 8 + count.pool * 1.5 + game.clarity * 0.16 - heat * 5.5, 10, 100);
    game.populations.kelp = drift(previous.kelp, kelpCap, 0.19, -heat * 1.15 - (climate.storm ? 3 : 0) - (game.clarity < 34 ? 2 : 0));

    const musselCap = clamp(17 + count.pool * 5 + count.kelp * 2.1 + game.clarity * 0.19 + count.reserve * 0.45 - count.debris * 3.5, 8, 100);
    game.populations.mussels = drift(previous.mussels, musselCap, 0.17, game.clarity < 35 ? -2.5 : 0);

    const grazerCap = clamp(14 + count.eelgrass * 4.7 + count.kelp * 1.7 + game.clarity * 0.14 - heat * 1.4, 8, 100);
    game.populations.grazers = drift(previous.grazers, grazerCap, 0.18, game.populations.kelp < 25 ? -2 : 0);

    const fishCap = clamp(11 + count.pool * 2.8 + count.eelgrass * 2.4 + count.kelp * 1.4 + (game.populations.mussels + game.populations.grazers) * 0.2 - count.debris * 1.5, 8, 96);
    game.populations.fish = drift(previous.fish, fishCap, 0.16, climate.storm ? -1.5 : 0);

    const crabCap = clamp(11 + count.pool * 3.7 + game.populations.mussels * 0.22 + count.reserve * 0.65 - count.debris, 8, 92);
    game.populations.crabs = drift(previous.crabs, crabCap, 0.16, 0);

    const birdCap = clamp(7 + (game.populations.fish + game.populations.crabs) * 0.29 + count.eelgrass * 0.42, 8, 88);
    game.populations.birds = drift(previous.birds, birdCap, 0.14, climate.storm ? -1 : 0);
    game.previous = previous;

    const event = climate.runoff
      ? `Runoff muddied the shallows; clarity is now ${Math.round(game.clarity)}.`
      : climate.storm
        ? `A rough swell crossed the reserve; sheltered pools buffered the blow.`
        : heat > 1.5
          ? `Warm water tested the kelp canopy; refuges helped limit stress.`
          : `Gentle conditions let the food web settle into its habitat.`;
    addLog(`Week ${game.week} resolved · ${event}`);
  }

  function drift(population, capacity, rate, shock) {
    return clamp(population + (capacity - population) * rate + shock, 0, 100);
  }

  function advanceWeek() {
    if (game.status !== 'active') return;
    const completedWeek = game.week;
    simulateWeek();
    if (completedWeek === MAX_WEEKS) {
      const score = biodiversity();
      const minimum = Math.min(...SPECIES.map(({ key }) => game.populations[key]));
      game.status = score >= 64 && minimum >= 28 ? 'won' : 'complete';
      if (game.status === 'won') {
        game.message = `Season secured! The reserve finished at ${score} biodiversity with every group above 28.`;
        addLog(`Season complete · Reserve goal reached with an index of ${score}.`);
      } else {
        game.message = `Season complete at ${score}. The reserve needs more balanced recovery; restart and try a different restoration plan.`;
        addLog(`Season complete · Biodiversity ${score}; target is 64 with no species group below 28.`);
      }
      render();
      return;
    }
    game.week += 1;
    game.actions = ACTIONS_PER_WEEK;
    game.conditions = makeForecast(game.week, game.rng);
    game.message = `Week ${completedWeek} settled. ${game.conditions.note}. Choose two actions for week ${game.week}.`;
    addLog(`Week ${game.week} outlook · ${game.conditions.note}.`);
    render();
  }

  function restart() {
    game = makeGame();
    game.selected = null;
    render();
    say('Fresh season started. Select a tile and plan two actions for week 1.');
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  makeSpeciesRows();
  actionButtons.forEach((button) => button.addEventListener('click', () => applyAction(button.dataset.action)));
  els.advance.addEventListener('click', advanceWeek);
  els.restart.addEventListener('click', restart);
  render();
})();
