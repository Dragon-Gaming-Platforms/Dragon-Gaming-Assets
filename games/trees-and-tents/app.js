const levels = [
  {
    name: "晨雾林地", nameEn: "Morning Mist Grove", subtitle: "5 × 5 · 初次扎营", subtitleEn: "5 × 5 · First camp", difficulty: "新手", difficultyEn: "Beginner",
    size: 5,
    trees: [[0,0],[0,4],[1,2],[3,0],[3,3]],
    solution: [[0,1],[1,4],[2,2],[4,0],[4,3]],
    rows: [1,1,1,0,2], cols: [1,1,1,1,1]
  },
  {
    name: "松果小径", nameEn: "Pinecone Path", subtitle: "6 × 6 · 林间漫步", subtitleEn: "6 × 6 · Forest stroll", difficulty: "简单", difficultyEn: "Easy",
    size: 6,
    trees: [[0,1],[1,3],[2,5],[2,1],[3,3],[3,0],[4,2],[4,5]],
    solution: [[0,0],[0,3],[1,5],[2,2],[3,4],[4,0],[5,2],[5,5]],
    rows: [2,1,1,1,1,2], cols: [2,0,2,1,1,2]
  },
  {
    name: "萤火溪谷", nameEn: "Firefly Creek", subtitle: "7 × 7 · 月下寻路", subtitleEn: "7 × 7 · Moonlit trail", difficulty: "进阶", difficultyEn: "Intermediate",
    size: 7,
    trees: [[0,0],[1,4],[0,6],[1,2],[2,0],[2,4],[3,6],[4,2],[5,0],[5,4]],
    solution: [[0,1],[0,4],[1,6],[2,2],[3,0],[3,4],[4,6],[5,2],[6,0],[6,4]],
    rows: [2,1,1,2,1,1,2], cols: [2,1,2,0,3,0,2]
  },
  {
    name: "星落山丘", nameEn: "Starfall Hill", subtitle: "8 × 8 · 高地远征", subtitleEn: "8 × 8 · Hilltop expedition", difficulty: "挑战", difficultyEn: "Challenge",
    size: 8,
    trees: [[0,1],[1,3],[0,5],[1,1],[1,5],[2,7],[3,3],[4,0],[4,6],[6,1],[6,4],[6,7]],
    solution: [[0,0],[0,3],[0,6],[2,1],[2,5],[3,7],[4,3],[5,0],[5,6],[7,1],[7,4],[7,7]],
    rows: [3,0,2,1,1,2,0,3], cols: [2,2,0,2,1,1,2,2]
  },
  {
    name: "蘑菇岔路", nameEn: "Mushroom Fork", subtitle: "6 × 6 · 雨后探路", subtitleEn: "6 × 6 · After the rain", difficulty: "简单", difficultyEn: "Easy",
    size: 6,
    trees: [[0,4],[1,2],[2,0],[2,4],[3,2],[3,5],[4,3],[4,0]],
    solution: [[0,5],[0,2],[1,0],[2,3],[3,1],[4,5],[5,3],[5,0]],
    rows: [2,1,1,1,1,2], cols: [2,1,1,2,0,2]
  },
  {
    name: "白桦风谷", nameEn: "Birchwind Valley", subtitle: "7 × 7 · 迎风扎营", subtitleEn: "7 × 7 · Camp in the breeze", difficulty: "进阶", difficultyEn: "Intermediate",
    size: 7,
    trees: [[0,6],[4,5],[6,6],[2,5],[0,4],[4,4],[6,3],[2,2],[0,1],[4,1]],
    solution: [[1,6],[4,6],[6,5],[2,4],[0,3],[4,3],[6,2],[2,1],[0,0],[4,0]],
    rows: [2,1,2,0,3,0,2], cols: [2,1,1,2,1,1,2]
  },
  {
    name: "云杉秘境", nameEn: "Spruce Sanctuary", subtitle: "8 × 8 · 深林回响", subtitleEn: "8 × 8 · Deep forest echo", difficulty: "挑战", difficultyEn: "Challenge",
    size: 8,
    trees: [[0,6],[1,4],[0,2],[1,6],[1,2],[2,0],[3,4],[4,7],[4,1],[6,6],[6,3],[6,0]],
    solution: [[0,7],[0,4],[0,1],[2,6],[2,2],[3,0],[4,4],[5,7],[5,1],[7,6],[7,3],[7,0]],
    rows: [3,0,2,1,1,2,0,3], cols: [2,2,1,1,2,0,2,2]
  },
  {
    name: "苔藓花园", nameEn: "Moss Garden", subtitle: "5 × 5 · 小而机灵", subtitleEn: "5 × 5 · Small but clever", difficulty: "灵巧", difficultyEn: "Nimble",
    size: 5,
    trees: [[4,0],[4,4],[3,2],[1,0],[1,3]],
    solution: [[4,1],[3,4],[2,2],[0,0],[0,3]],
    rows: [2,0,1,1,1], cols: [1,1,1,1,1]
  },
  {
    name: "月见湖畔", nameEn: "Moonview Lake", subtitle: "9 × 9 · 湖光露营", subtitleEn: "9 × 9 · Lakeside camp", difficulty: "专家", difficultyEn: "Expert",
    size: 9,
    trees: [[0,1],[1,3],[1,6],[0,8],[1,1],[3,4],[2,7],[3,0],[4,2],[4,5],[4,8],[5,1],[6,4],[6,7],[7,0]],
    solution: [[0,0],[0,3],[0,6],[1,8],[2,1],[2,4],[3,7],[4,0],[4,3],[5,5],[5,8],[6,1],[7,4],[7,7],[8,0]],
    rows: [3,1,2,1,2,2,1,2,1], cols: [3,2,0,2,2,1,1,2,2]
  },
  {
    name: "极光树海", nameEn: "Aurora Woods", subtitle: "9 × 9 · 终章远征", subtitleEn: "9 × 9 · Final expedition", difficulty: "大师", difficultyEn: "Master",
    size: 9,
    trees: [[1,1],[1,5],[0,7],[0,3],[1,7],[2,0],[2,5],[3,2],[3,8],[4,6],[5,0],[5,3],[6,7],[7,1],[7,4]],
    solution: [[0,1],[0,5],[0,8],[1,3],[2,7],[3,0],[3,5],[4,2],[4,8],[5,6],[6,0],[6,3],[7,7],[8,1],[8,4]],
    rows: [3,1,1,2,2,1,2,1,2], cols: [2,2,1,2,1,2,1,2,2]
  }
];

const translations = {
  zh: {
    pageTitle: "林间营地 · Trees & Tents",
    description: "林间营地：一款卡通可爱的 Trees and Tents 逻辑游戏。",
    brandName: "林间营地",
    homeLabel: "林间营地首页",
    languageLabel: "Switch to English",
    languageTitle: "English",
    soundOn: "关闭音效",
    soundOff: "开启音效",
    soundTitle: "音效",
    rulesButton: "游戏规则",
    introEyebrow: "今日林间任务",
    introTitle: "给每棵小树，<br />搭一顶<span>专属帐篷</span>",
    introDescription: "观察行列提示，在不打扰邻居的情况下安排营地。慢慢想，森林不催你。",
    trailCopy: "从简单的<br />小营地开始吧",
    gameArea: "游戏区域",
    levelPanel: "关卡选择",
    mapLabel: "探险地图",
    mapTitle: "选择营地",
    levelList: "关卡列表",
    completedLabel: "营地已完成",
    gameStatus: "游戏状态",
    timeLabel: "用时",
    tentsLabel: "帐篷",
    rowNote: "每行帐篷数",
    colNote: "每列帐篷数",
    boardLabel: "Trees and Tents 棋盘",
    toolsLabel: "放置工具",
    tentToolTitle: "搭帐篷",
    tentToolHelp: "放置 / 移除",
    grassToolTitle: "标记草地",
    grassToolHelp: "排除空格",
    hintLabel: "提示",
    resetLabel: "重置",
    stripOne: "每棵树对应 1 顶帐篷",
    stripTwo: "只可正向相邻",
    stripThree: "帐篷之间不相邻",
    footerCopy: "在森林里，聪明比速度更重要。",
    close: "关闭",
    rulesEyebrow: "出发前读一读",
    rulesTitle: "怎样安排营地？",
    ruleOneTitle: "树与帐篷，一一结伴",
    ruleOneCopy: "每棵树四周的 4 个正邻格（上、下、左、右）中，合计恰好有 1 顶帐篷；不是每个方向各放 1 顶。每顶帐篷也只与一棵树配对。",
    ruleTwoTitle: "给彼此留点空间",
    ruleTwoCopy: "两顶帐篷不能挨在一起，就连斜对角也不可以。",
    ruleThreeTitle: "听从路标数字",
    ruleThreeCopy: "棋盘外的数字表示这一行或这一列需要放置的帐篷总数。",
    rulesConfirm: "明白了，出发！",
    winEyebrow: "营地安排完成",
    winTitle: "这片森林住得很舒服！",
    replay: "再玩一次",
    next: "前往下一站",
    first: "回到第一站",
    locked: "，尚未解锁",
    colClue: (index, count) => `第 ${index} 列需要 ${count} 顶帐篷`,
    rowClue: (index, count) => `第 ${index} 行需要 ${count} 顶帐篷`,
    treeCell: "树木",
    emptyCell: (row, col) => `第 ${row} 行第 ${col} 列，空地`,
    cellState: (row, col, state) => `第 ${row} 行第 ${col} 列，${state}`,
    tentState: "帐篷",
    grassState: "已标记草地",
    emptyState: "空地",
    winSummary: (time, name) => `你在 ${time} 内完成了「${name}」。`,
    noHint: "已经没有需要提示的地方啦",
    removeHint: "这顶帐篷的位置不太合适",
    placeHint: "风吹过的地方，适合搭一顶帐篷",
    resetToast: "营地已经恢复原样"
  },
  en: {
    pageTitle: "Forest Camp · Trees & Tents",
    description: "Forest Camp is a charming Trees and Tents logic puzzle for your browser.",
    brandName: "Forest Camp",
    homeLabel: "Forest Camp home",
    languageLabel: "切换到中文",
    languageTitle: "中文",
    soundOn: "Mute sound",
    soundOff: "Turn sound on",
    soundTitle: "Sound",
    rulesButton: "How to play",
    introEyebrow: "TODAY'S FOREST QUEST",
    introTitle: "Every little tree needs<br />one <span>perfect tent</span>",
    introDescription: "Follow the row and column clues, then set up camp without crowding the neighbors. Take your time—the forest can wait.",
    trailCopy: "Begin with a<br />tiny campsite",
    gameArea: "Game area",
    levelPanel: "Level selection",
    mapLabel: "ADVENTURE MAP",
    mapTitle: "Choose a camp",
    levelList: "Level list",
    completedLabel: "camps completed",
    gameStatus: "Game status",
    timeLabel: "TIME",
    tentsLabel: "TENTS",
    rowNote: "Tents in each row",
    colNote: "Tents in each column",
    boardLabel: "Trees and Tents game board",
    toolsLabel: "Placement tools",
    tentToolTitle: "Pitch a tent",
    tentToolHelp: "Place / remove",
    grassToolTitle: "Mark grass",
    grassToolHelp: "Rule out a cell",
    hintLabel: "Hint",
    resetLabel: "Reset",
    stripOne: "One tent per tree",
    stripTwo: "Orthogonal only",
    stripThree: "Tents never touch",
    footerCopy: "In the forest, clever matters more than fast.",
    close: "Close",
    rulesEyebrow: "BEFORE YOU SET OUT",
    rulesTitle: "How do we set up camp?",
    ruleOneTitle: "Pair every tree with one tent",
    ruleOneCopy: "Among the four cells directly beside each tree—up, down, left, and right—there must be exactly one tent in total. This does not mean one tent in every direction. Each tent is paired with only one tree.",
    ruleTwoTitle: "Give every tent some space",
    ruleTwoCopy: "Tents may not touch one another, not even diagonally.",
    ruleThreeTitle: "Follow the number signs",
    ruleThreeCopy: "The numbers outside the board tell you how many tents belong in each row or column.",
    rulesConfirm: "Got it—let's go!",
    winEyebrow: "CAMPSITE COMPLETE",
    winTitle: "The forest feels right at home!",
    replay: "Play again",
    next: "Next campsite",
    first: "Back to the first camp",
    locked: ", locked",
    colClue: (index, count) => `Column ${index} needs ${count} tent${count === 1 ? "" : "s"}`,
    rowClue: (index, count) => `Row ${index} needs ${count} tent${count === 1 ? "" : "s"}`,
    treeCell: "Tree",
    emptyCell: (row, col) => `Row ${row}, column ${col}: empty`,
    cellState: (row, col, state) => `Row ${row}, column ${col}: ${state}`,
    tentState: "tent",
    grassState: "marked as grass",
    emptyState: "empty",
    winSummary: (time, name) => `You completed ${name} in ${time}.`,
    noHint: "There is nothing left to hint at.",
    removeHint: "That tent may want a different spot.",
    placeHint: "A breeze points to a good place for a tent.",
    resetToast: "The campsite is fresh again."
  }
};

const icons = {
  tree: `<svg viewBox="0 0 48 48" aria-hidden="true"><path class="tree-trunk" d="M20 29h8l2.2 14H17.8L20 29Z"/><path class="tree-crown" d="M23.5 3c5.4 0 8 4.3 7.7 8.2 5.3.4 7.9 4.2 6.7 8-1.2 3.7-4.4 5.5-7.5 5.2.3 4.2-2.7 7.5-7.2 7.5-4.2 0-6.8-2.4-7-5.7-4.6 1.1-8.3-1.5-8.4-5.4-.2-4.2 2.5-6.3 6-6.8-1.2-5 2.2-11 9.7-11Z"/><path class="tree-light" d="M17 9c-2.6 2.3-3.4 6.8-.9 8.5 2 1.4 3.4-.8 3-2.3-.8-3.2 1.4-5.5-2.1-6.2Z"/><circle class="tree-dot" cx="29.5" cy="11.5" r="2"/><circle class="tree-dot" cx="13.5" cy="20" r="1.5"/></svg>`,
  tent: `<svg viewBox="0 0 48 48" aria-hidden="true"><path class="tent-fabric" d="M5 39 22.4 8.8c.7-1.2 2.5-1.2 3.2 0L43 39H5Z"/><path class="tent-light" d="M24 9v30H6L24 9Z"/><path class="tent-door" d="m24 18 9.4 21H24V18Z"/><path class="tent-line" d="M24 9v30M24 18 13 39"/><circle cx="40.5" cy="39.5" r="1.5" fill="#8e6748"/><circle cx="7.5" cy="39.5" r="1.5" fill="#8e6748"/></svg>`,
  grass: `<svg class="grass-mark" viewBox="0 0 36 36" aria-hidden="true"><path d="M6 27c5-1 8-5 9-12 3 4 4 8 3 12 3-7 7-11 13-13-3 5-4 9-4 13M5 28h26"/></svg>`
};

const board = document.querySelector("#game-board");
const levelList = document.querySelector(".level-list");
const timerNode = document.querySelector("#timer");
const tentCountNode = document.querySelector("#tent-count");
const tentTotalNode = document.querySelector("#tent-total");
const hintCountNode = document.querySelector("#hint-count");
const completedCountNode = document.querySelector("#completed-count");
const toast = document.querySelector("#toast");
const winDialog = document.querySelector("#win-dialog");
const rulesDialog = document.querySelector("#rules-dialog");

let currentLevel = 0;
let cells = [];
let selectedTool = "tent";
let elapsed = 0;
let timerId = null;
let hintsLeft = 3;
let started = false;
let won = false;
let winTimer = null;
let soundEnabled = true;
function readSave(key, fallback) {
  try { return localStorage.getItem('dragon-gaming.trees-and-tents.' + key) ?? fallback; }
  catch { return fallback; }
}
function writeSave(key, value) {
  try { localStorage.setItem('dragon-gaming.trees-and-tents.' + key, value); } catch { /* optional storage */ }
}
let locale = readSave("locale", "") || (navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en");
if (!["en","zh"].includes(locale)) locale = "en";
let completed = new Set();
try {
  const saved = JSON.parse(readSave('completed', '[]'));
  if (Array.isArray(saved)) completed = new Set(saved.filter(n => Number.isInteger(n) && n >= 0 && n < levels.length));
} catch { /* malformed progress starts fresh */ }

function key(r, c) { return `${r},${c}`; }
function includesCoord(list, r, c) { return list.some(([rr, cc]) => rr === r && cc === c); }
function formatTime(value) { return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }
function t(keyName) { return translations[locale][keyName]; }
function levelText(level, property) { return locale === "en" ? level[`${property}En`] : level[property]; }

function setText(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element) element.textContent = value;
}

function setHtml(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element) element.innerHTML = value;
}

function updateNextButton() {
  const nextButton = document.querySelector("#next-button");
  const isLast = currentLevel === levels.length - 1;
  nextButton.innerHTML = `${isLast ? t("first") : t("next")} <span>${isLast ? "↺" : "→"}</span>`;
}

function applyLocale() {
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  document.title = t("pageTitle");
  document.querySelector('meta[name="description"]').content = t("description");
  document.querySelector(".brand").setAttribute("aria-label", t("homeLabel"));
  document.querySelector(".language-button").textContent = locale === "zh" ? "EN" : "中";
  document.querySelector(".language-button").setAttribute("aria-label", t("languageLabel"));
  document.querySelector(".language-button").title = t("languageTitle");
  const soundButton = document.querySelector(".sound-button");
  soundButton.setAttribute("aria-label", soundEnabled ? t("soundOn") : t("soundOff"));
  soundButton.title = t("soundTitle");

  const textValues = {
    "brand-name": "brandName", "rules-button-label": "rulesButton", "intro-eyebrow": "introEyebrow",
    "intro-description": "introDescription", "map-label": "mapLabel", "map-title": "mapTitle",
    "completed-label": "completedLabel", "time-label": "timeLabel", "tents-label": "tentsLabel",
    "row-note": "rowNote", "col-note": "colNote", "tent-tool-title": "tentToolTitle",
    "tent-tool-help": "tentToolHelp", "grass-tool-title": "grassToolTitle", "grass-tool-help": "grassToolHelp",
    "hint-label": "hintLabel", "reset-label": "resetLabel", "strip-rule-one": "stripOne",
    "strip-rule-two": "stripTwo", "strip-rule-three": "stripThree", "footer-copy": "footerCopy",
    "rules-eyebrow": "rulesEyebrow", "rules-title": "rulesTitle", "rule-one-title": "ruleOneTitle",
    "rule-one-copy": "ruleOneCopy", "rule-two-title": "ruleTwoTitle", "rule-two-copy": "ruleTwoCopy",
    "rule-three-title": "ruleThreeTitle", "rule-three-copy": "ruleThreeCopy", "rules-confirm": "rulesConfirm",
    "win-eyebrow": "winEyebrow", "win-title": "winTitle", "replay-button": "replay"
  };
  Object.entries(textValues).forEach(([id, keyName]) => setText(id, t(keyName)));
  setHtml("page-title", t("introTitle"));
  setHtml("trail-copy", t("trailCopy"));

  document.querySelector(".game-area").setAttribute("aria-label", t("gameArea"));
  document.querySelector(".level-panel").setAttribute("aria-label", t("levelPanel"));
  levelList.setAttribute("aria-label", t("levelList"));
  document.querySelector(".game-stats").setAttribute("aria-label", t("gameStatus"));
  document.querySelector(".draw-tools").setAttribute("aria-label", t("toolsLabel"));
  board.setAttribute("aria-label", t("boardLabel"));
  document.querySelectorAll(".modal-close").forEach(button => button.setAttribute("aria-label", t("close")));

  if (cells.length) {
    setText("level-title", levelText(levels[currentLevel], "name"));
    setText("difficulty-label", levelText(levels[currentLevel], "difficulty"));
    setText("win-summary", t("winSummary")(formatTime(elapsed), levelText(levels[currentLevel], "name")));
    renderLevels();
    renderBoard();
    updateBoardState();
  }
  updateNextButton();
}

function renderLevels() {
  levelList.innerHTML = levels.map((level, index) => {
    const isComplete = completed.has(index);
    const isLocked = index > 0 && !completed.has(index - 1);
    const name = levelText(level, "name");
    const subtitle = levelText(level, "subtitle");
    return `<button type="button" class="level-item ${index === currentLevel ? "is-active" : ""} ${isComplete ? "is-complete" : ""}" data-level="${index}" ${isLocked ? "disabled" : ""} aria-label="${name}${isLocked ? t("locked") : ""}">
      <span class="level-number">${isComplete ? "✓" : String(index + 1).padStart(2, "0")}</span>
      <span class="level-copy"><strong>${name}</strong><small>${subtitle}</small></span>
      <span class="level-state" aria-hidden="true">${isLocked ? "♢" : isComplete ? "●" : "›"}</span>
    </button>`;
  }).join("");
  completedCountNode.textContent = completed.size;
  document.querySelector("#total-count").textContent = levels.length;
}

function loadLevel(index) {
  clearTimeout(winTimer);
  winTimer = null;
  won = false;
  if (winDialog.open) winDialog.close();
  currentLevel = index;
  const level = levels[index];
  elapsed = 0;
  hintsLeft = 3;
  started = false;
  clearInterval(timerId);
  timerId = null;
  timerNode.textContent = "00:00";
  hintCountNode.textContent = hintsLeft;
  document.querySelector("#hint-button").disabled = false;
  document.querySelector("#level-title").textContent = levelText(level, "name");
  document.querySelector("#difficulty-label").textContent = levelText(level, "difficulty");
  tentTotalNode.textContent = level.solution.length;
  board.style.setProperty("--size", level.size);
  board.setAttribute("aria-rowcount", level.size);
  board.setAttribute("aria-colcount", level.size);
  cells = Array.from({ length: level.size }, () => Array(level.size).fill("empty"));
  level.trees.forEach(([r,c]) => { cells[r][c] = "tree"; });
  renderLevels();
  renderBoard();
  board.classList.remove("is-arriving");
  void board.offsetWidth;
  board.classList.add("is-arriving");
  updateBoardState();
}

function renderBoard() {
  const level = levels[currentLevel];
  let html = `<div class="corner" aria-hidden="true"></div>`;
  level.cols.forEach((clue, c) => { html += `<div class="clue col-clue" data-col="${c}" aria-label="${t("colClue")(c + 1, clue)}">${clue}</div>`; });
  for (let r = 0; r < level.size; r++) {
    html += `<div class="clue row-clue" data-row="${r}" aria-label="${t("rowClue")(r + 1, level.rows[r])}">${level.rows[r]}</div>`;
    for (let c = 0; c < level.size; c++) {
      const state = cells[r][c];
      const stateLabel = state === "tent" ? t("tentState") : state === "grass" ? t("grassState") : t("emptyState");
      const label = state === "tree" ? t("treeCell") : state === "empty" ? t("emptyCell")(r + 1, c + 1) : t("cellState")(r + 1, c + 1, stateLabel);
      const stateClass = state === "tree" ? "is-tree" : state === "tent" ? "is-tent" : "";
      const content = state === "tree" ? icons.tree : state === "tent" ? icons.tent : state === "grass" ? icons.grass : "";
      html += `<button type="button" role="gridcell" class="cell ${stateClass}" style="--delay:${r + c}" data-row="${r}" data-col="${c}" aria-label="${label}" ${state === "tree" ? "tabindex=\"-1\"" : ""}>${content}</button>`;
    }
  }
  board.innerHTML = html;
}

function startTimer() {
  if (started) return;
  started = true;
  timerId = setInterval(() => { elapsed++; timerNode.textContent = formatTime(elapsed); }, 1000);
}

function setCell(r, c, tool = selectedTool) {
  if (won || cells[r][c] === "tree") return;
  startTimer();
  cells[r][c] = cells[r][c] === tool ? "empty" : tool;
  const node = board.querySelector(`[data-row="${r}"][data-col="${c}"]`);
  node.classList.toggle("is-tent", cells[r][c] === "tent");
  node.innerHTML = cells[r][c] === "tent" ? icons.tent : cells[r][c] === "grass" ? icons.grass : "";
  const stateLabel = cells[r][c] === "tent" ? t("tentState") : cells[r][c] === "grass" ? t("grassState") : t("emptyState");
  node.setAttribute("aria-label", t("cellState")(r + 1, c + 1, stateLabel));
  playTone(cells[r][c] === "tent" ? 430 : 300, .035);
  updateBoardState();
  if (cells[r][c] === "tent") checkWin();
}

function updateBoardState() {
  const level = levels[currentLevel];
  const tents = [];
  for (let r = 0; r < level.size; r++) for (let c = 0; c < level.size; c++) if (cells[r][c] === "tent") tents.push([r,c]);
  tentCountNode.textContent = tents.length;

  level.rows.forEach((clue, r) => {
    const count = tents.filter(([rr]) => rr === r).length;
    const el = board.querySelector(`[data-row="${r}"].row-clue`);
    el.classList.toggle("is-complete", count === clue);
    el.classList.toggle("is-error", count > clue);
  });
  level.cols.forEach((clue, c) => {
    const count = tents.filter(([,cc]) => cc === c).length;
    const el = board.querySelector(`[data-col="${c}"].col-clue`);
    el.classList.toggle("is-complete", count === clue);
    el.classList.toggle("is-error", count > clue);
  });

  board.querySelectorAll(".cell").forEach(el => el.classList.remove("has-conflict"));
  tents.forEach(([r,c]) => {
    const conflict = tents.some(([rr,cc]) => (rr !== r || cc !== c) && Math.abs(rr-r) <= 1 && Math.abs(cc-c) <= 1);
    if (conflict) board.querySelector(`[data-row="${r}"][data-col="${c}"]`).classList.add("has-conflict");
  });
}

function hasPerfectTreeMatching(tents, trees) {
  const edges = tents.map(([r,c]) => trees.reduce((acc, [tr,tc], i) => {
    if (Math.abs(tr-r) + Math.abs(tc-c) === 1) acc.push(i);
    return acc;
  }, []));
  const matchedTree = Array(trees.length).fill(-1);
  function assign(tentIndex, seen) {
    for (const treeIndex of edges[tentIndex]) {
      if (seen[treeIndex]) continue;
      seen[treeIndex] = true;
      if (matchedTree[treeIndex] < 0 || assign(matchedTree[treeIndex], seen)) {
        matchedTree[treeIndex] = tentIndex;
        return true;
      }
    }
    return false;
  }
  return tents.every((_, i) => assign(i, Array(trees.length).fill(false)));
}

function isSolved() {
  const level = levels[currentLevel];
  const tents = [];
  for (let r=0;r<level.size;r++) for (let c=0;c<level.size;c++) if (cells[r][c] === "tent") tents.push([r,c]);
  if (tents.length !== level.trees.length) return false;
  if (level.rows.some((n,r) => tents.filter(([rr]) => rr === r).length !== n)) return false;
  if (level.cols.some((n,c) => tents.filter(([,cc]) => cc === c).length !== n)) return false;
  if (tents.some(([r,c], i) => tents.some(([rr,cc], j) => i !== j && Math.abs(rr-r) <= 1 && Math.abs(cc-c) <= 1))) return false;
  return hasPerfectTreeMatching(tents, level.trees);
}

function checkWin() {
  if (won || !isSolved()) return;
  won = true;
  clearInterval(timerId);
  completed.add(currentLevel);
  writeSave("completed", JSON.stringify([...completed]));
  renderLevels();
  playWinSound();
  launchConfetti();
  document.querySelector("#win-summary").textContent = t("winSummary")(formatTime(elapsed), levelText(levels[currentLevel], "name"));
  updateNextButton();
  winTimer = setTimeout(() => { if (won) winDialog.showModal(); }, 420);
}

function useHint() {
  if (won || hintsLeft <= 0) return;
  startTimer();
  const level = levels[currentLevel];
  let target = level.solution.find(([r,c]) => cells[r][c] !== "tent");
  if (!target) {
    for (let r=0;r<level.size && !target;r++) for (let c=0;c<level.size;c++) {
      if (cells[r][c] === "tent" && !includesCoord(level.solution,r,c)) { target = [r,c,"remove"]; break; }
    }
  }
  if (!target) { showToast(t("noHint")); return; }
  const [r,c,action] = target;
  cells[r][c] = action === "remove" ? "grass" : "tent";
  hintsLeft--;
  hintCountNode.textContent = hintsLeft;
  document.querySelector("#hint-button").disabled = hintsLeft === 0;
  const node = board.querySelector(`[data-row="${r}"][data-col="${c}"]`);
  node.classList.toggle("is-tent", cells[r][c] === "tent");
  node.classList.add("is-hinted");
  node.innerHTML = cells[r][c] === "tent" ? icons.tent : icons.grass;
  setTimeout(() => node.classList.remove("is-hinted"), 2100);
  updateBoardState();
  showToast(action === "remove" ? t("removeHint") : t("placeHint"));
  checkWin();
}

function resetLevel() {
  const hadMoves = cells.some(row => row.some(state => state === "tent" || state === "grass"));
  loadLevel(currentLevel);
  if (hadMoves) showToast(t("resetToast"));
}

function selectTool(tool) {
  selectedTool = tool;
  document.querySelectorAll("[data-tool]").forEach(button => {
    const active = button.dataset.tool === tool;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

let toastTimeout;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function playTone(frequency, duration) {
  if (!soundEnabled) return;
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.04, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(); oscillator.stop(context.currentTime + duration);
  } catch (_) { /* Audio is an optional enhancement. */ }
}

function playWinSound() {
  [523,659,784].forEach((tone,index) => setTimeout(() => playTone(tone,.16), index * 110));
}

function launchConfetti() {
  const colors = ["#eb805a", "#f7c95e", "#3f8a69", "#7bc8d0", "#fff4d4"];
  for (let i=0;i<34;i++) {
    const piece = document.createElement("i");
    piece.className = "confetti";
    piece.style.left = `${15 + Math.random()*70}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.setProperty("--drift", `${(Math.random()-.5)*240}px`);
    piece.style.animationDelay = `${Math.random()*.45}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2500);
  }
}

function createForestAmbience() {
  const layer = document.createElement("div");
  layer.className = "ambience";
  layer.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 13; i++) {
    const firefly = document.createElement("i");
    firefly.className = "firefly";
    firefly.style.left = `${4 + Math.random() * 92}%`;
    firefly.style.top = `${10 + Math.random() * 78}%`;
    firefly.style.setProperty("--travel-x", `${-35 + Math.random() * 70}px`);
    firefly.style.setProperty("--travel-y", `${-25 + Math.random() * 50}px`);
    firefly.style.animationDelay = `${-Math.random() * 8}s`;
    firefly.style.animationDuration = `${5 + Math.random() * 5}s`;
    layer.appendChild(firefly);
  }
  document.body.prepend(layer);
}

board.addEventListener("click", event => {
  const cell = event.target.closest(".cell");
  if (!cell || cell.classList.contains("is-tree")) return;
  setCell(Number(cell.dataset.row), Number(cell.dataset.col));
});

board.addEventListener("contextmenu", event => {
  const cell = event.target.closest(".cell");
  if (!cell || cell.classList.contains("is-tree")) return;
  event.preventDefault();
  setCell(Number(cell.dataset.row), Number(cell.dataset.col), "grass");
});

levelList.addEventListener("click", event => {
  const button = event.target.closest("[data-level]");
  if (button && !button.disabled) loadLevel(Number(button.dataset.level));
});

document.querySelectorAll("[data-tool]").forEach(button => button.addEventListener("click", () => selectTool(button.dataset.tool)));
document.querySelector("#hint-button").addEventListener("click", useHint);
document.querySelector("#reset-button").addEventListener("click", resetLevel);
document.querySelector("#replay-button").addEventListener("click", () => { winDialog.close(); loadLevel(currentLevel); });
document.querySelector("#next-button").addEventListener("click", () => { winDialog.close(); loadLevel((currentLevel + 1) % levels.length); });
document.querySelector(".sound-button").addEventListener("click", event => {
  soundEnabled = !soundEnabled;
  event.currentTarget.setAttribute("aria-pressed", String(soundEnabled));
  event.currentTarget.setAttribute("aria-label", soundEnabled ? t("soundOn") : t("soundOff"));
  if (soundEnabled) playTone(520,.08);
});
document.querySelector(".language-button").addEventListener("click", () => {
  locale = locale === "zh" ? "en" : "zh";
  writeSave("locale", locale);
  applyLocale();
});
document.querySelectorAll("[data-open-rules]").forEach(button => button.addEventListener("click", () => rulesDialog.showModal()));
document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
[rulesDialog, winDialog].forEach(dialog => dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); }));
document.addEventListener("keydown", event => {
  if (event.key === "1") selectTool("tent");
  if (event.key === "2") selectTool("grass");
  if (event.key === "Escape") document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close());
});

const gameCard = document.querySelector(".game-card");
gameCard.addEventListener("pointermove", event => {
  const rect = gameCard.getBoundingClientRect();
  gameCard.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
  gameCard.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
});

createForestAmbience();
applyLocale();
loadLevel(0);
