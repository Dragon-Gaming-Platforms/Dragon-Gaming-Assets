import {Piece} from "./piece.mjs";
import {Player} from './player.mjs';
import {Board} from './board.mjs';
import {Move} from './move.mjs';
import {HalmaSettings} from './halmaSettings.mjs';

export class HalmaGame {
    constructor(msgCallback, saveGameCallback, availableSpaceCallback) {
        this.showMessage = msgCallback;
        this.saveGame = saveGameCallback;
        this.getAvailableSpace = availableSpaceCallback;
    }

    startGame(settings) {
        this.settings = settings;
        this.board = new Board(this.settings, this.onTdClick.bind(this));
        this.chosenPiece = undefined;
        this.players = [];
        let colors = settings.getPlayerColors();

        for (let k in colors) {
            this.players.push(new Player(colors[k]));
        }
        this.playerInTurn = Math.floor(Math.random() * this.players.length);
        this.turnContinues = false;

        let szones = this.settings.getStartZones();

        for (let i = 0; i < szones.length; i++) {
            for (let j = 0; j < szones[i].length; j++) {
                if (szones[i][j]) {
                    let player = this.players.find(plr => plr.color === szones[i][j]);
                    let piece = new Piece(player.color, this.setChosenPiece.bind(this));
                    player.addPiece(piece);
                    piece.place(this.board.getSquare([j, i]))
                }
            }
        }
        this.resizeBoard();
        this.notifyPlayerInTurn();
        this.saveGame();
    }

    getElement() {
        return this.board.getElement();
    }

    toJSON() {
        return {
            'settings': this.settings.toJSON(),
            'players': this.players.map(p => p.toJSON()),
            'playerInTurn': this.playerInTurn,
            'chosenPiece': this.chosenPiece ? this.chosenPiece.toJSON() : undefined,
            'turnContinues': this.turnContinues
        };
    }

    static fromJSON(json, msgCallback, saveGameCallback, availableSpaceCallback) {
        let halma = new HalmaGame(msgCallback, saveGameCallback, availableSpaceCallback);
        halma.settings = HalmaSettings.fromJSON(json['settings']);
        halma.board = new Board(halma.settings, halma.onTdClick.bind(halma));
        halma.players = json['players'].map(
            plrJson => {
                let plr = new Player(plrJson['color']);
                plrJson['pieces'].forEach(
                    p => {
                        let piece = new Piece(plr.color, halma.setChosenPiece.bind(halma));
                        piece.place(halma.board.getSquare(p['position']));
                        plr.addPiece(piece);
                        if (p['chosen']) {
                            halma.chosenPiece = piece;
                            piece.highlight(true);
                        }
                    }
                )
                return plr;
            });
        halma.playerInTurn = json['playerInTurn'];
        halma.turnContinues = json['turnContinues'];

        halma.notifyPlayerInTurn();
        halma.resizeBoard();
        return halma;
    }

    getPlayerInTurn() {
        return this.players[this.playerInTurn];
    }

    onTdClick(square) {
        if (this.chosenPiece)
            this.movePiece(this.chosenPiece, square);
    }

    movePiece(piece, square) {
        let move = new Move(piece, square);
        if (move.isValid()) {
            if (!this.turnContinues || move.isJump()) {
                move.execute();
                if (piece.isInGoalZone() && this.getPlayerInTurn().hasWon()) {
                    this.notifyVictor();
                    this.chosenPiece.highlight(false);
                    this.chosenPiece = undefined;
                    this.turnContinues = true;
                }
                else {
                    this.turnContinues = move.canJumpAgain;
                    if (!this.turnContinues)
                        this.changeTurn();
                }
                this.saveGame();
            }
        }
    }

    setChosenPiece(piece) {
        if (piece.color === this.getPlayerInTurn().color && !this.turnContinues) {
            if (this.chosenPiece)
            this.chosenPiece.highlight(false);

            piece.highlight(true);
            this.chosenPiece = piece;

            //TODO should just save the piece selection
            //     not the entire game
            this.saveGame();
        }
    }

    changeTurn() {
        this.playerInTurn += 1;
        this.playerInTurn = this.playerInTurn % this.players.length;
        this.turnContinues = false;
        if (this.chosenPiece)
            this.chosenPiece.highlight(false);
        this.chosenPiece = undefined;
        this.notifyPlayerInTurn();
    }

    notifyPlayerInTurn() {
        this.showMessage(
            `${this.getPlayerInTurn().color} player turn`, 
            this.getPlayerInTurn().color
        );
    }

    notifyVictor() {
        this.showMessage(
            `${this.getPlayerInTurn().color} player won!`,
            this.getPlayerInTurn().color
        );
    }

    resizeBoard() {
        let size = this.getAvailableSpace();
        this.board.resize(size);
    }
}