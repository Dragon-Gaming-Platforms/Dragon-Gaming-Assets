'use strict';

import {HalmaGame} from "./halmaGame.mjs";
import {HalmaSettings} from './halmaSettings.mjs';

/*

author: jussiks
*/

var halma;

window.onload = function () {
    let newGameButton = document.getElementById('newGameButton');
    newGameButton.addEventListener('click', onNewGameClick);

    let endTurnButton = document.getElementById('endTurnButton');
    endTurnButton.addEventListener('click', onEndTurnClick);
    window.addEventListener('keydown', onKeyDown, false);

    halma = loadGame();
    if (halma.board) {
        boardDiv.appendChild(halma.getElement());
        updateForm(halma.settings);
    }
    else updateForm(new HalmaSettings());
};

// When window is resized, board will be resized to fit current window.
window.onresize = function () {
    halma.resizeBoard();
};

/*
    DOM
*/
function updateForm(settings) {
    selectRadioBtn('rbPlayers', settings.playerCount);
    selectRadioBtn('rbPieces', settings.pieceCount);
    let inputWidth = document.getElementById('inputWidth');
    inputWidth.value = settings.boardSize;
}

function selectRadioBtn(name, value) {
    let btns = document.getElementsByName(name);
    for (let i = 0; i < btns.length; i++) {
        if (btns[i].value == value) {
            btns[i].checked = true;
            break;
        }
    }
}

function getSettings() {
    let playerCount = parseInt(document.querySelector('input[name="rbPlayers"]:checked').value);
    let pieceCount = parseInt(document.querySelector('input[name="rbPieces"]:checked').value);
    let boardSize = parseInt(document.getElementById('inputWidth').value);
    return new HalmaSettings(playerCount, pieceCount, boardSize);
}

function getAvailableSpace() {
    let h1 = document.getElementsByTagName('h1')[0].clientHeight;
    let form = Math.max(document.getElementsByTagName('form')[0].clientHeight, 182);
    let width = document.documentElement.clientWidth;
    let height = document.documentElement.clientHeight - h1 - form;

    return Math.max(Math.min(width, height), 300)
}

const span = document.getElementById('messages');
const boardDiv = document.getElementById('boardDiv');

function showMessage(msg, color) {
    span.setAttribute('style', `color: ${color};`);
    span.innerText = '';
    span.appendChild(document.createTextNode(msg));
}

/*
    CLICK HANDLERS
*/

function onNewGameClick(e) {
    e.preventDefault();
    removeGame();

    let settings = getSettings();
    halma.startGame(settings);
    boardDiv.appendChild(halma.getElement());
}

function onEndTurnClick(e) {
    e.preventDefault();
    halma.changeTurn();
}

function onKeyDown(e) {
    if (e.keyCode === '32') {
        halma.changeTurn();
    }
}

/*
    LOCAL STORAGE
*/

const halmaGame_str = 'halmaJS_gameInfo';

function saveGame() {
    localStorage.setItem(halmaGame_str, JSON.stringify(halma.toJSON()));
}

function loadGame() {
    let halmaGame;
    try {
        let halmaJson = JSON.parse(localStorage.getItem(halmaGame_str));
        halmaGame = HalmaGame.fromJSON(halmaJson, showMessage, saveGame, getAvailableSpace);
    } 
    catch (e) {
        console.log(e);
        halmaGame = new HalmaGame(showMessage, saveGame, getAvailableSpace);
    }
    return halmaGame;
}

function removeGame() {
    boardDiv.innerHTML = '';
    localStorage.removeItem(halmaGame_str);
}
