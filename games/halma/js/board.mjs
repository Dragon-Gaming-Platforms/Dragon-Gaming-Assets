import {Square} from './square.mjs';

export class Board {
    constructor(settings, onSquareSelected) {
        this.onSquareClick = onSquareSelected;
        this.table = document.createElement('table');
        this.squares = [];
        let boardSize = settings.boardSize;
        let gzones = settings.getGoalZones();

        for (var i = 0; i < boardSize; i++) {
            var tr = document.createElement('tr');
            this.table.appendChild(tr);
            this.squares.push([]);
    
            for (var j = 0; j < boardSize; j++) {
                let square = new Square(this, [j, i], onSquareSelected);
                tr.appendChild(square.getElement());
                this.squares[i].push(square);

                if (gzones[i][j])
                    square.setGoalZone(gzones[i][j]);
            }
        }
    }

    asArray() {
        return this.squares.map(row => row.map(
            square => square.firstChild ? square.firstChild.getAttribute('class') : ''));
    }

    getElement() {
        return this.table;
    }

    getSquare([x, y]) {
        if (x < 0 || x > this.squares.length - 1 || 
            y < 0 || y > this.squares.length - 1)
            return undefined;
        return this.squares[y][x];
    }

    onTdClick(e) {
        e.stopPropagation();
        let td = e.target;
        this.onSquareClick(td);
    }

    resize(size) {
        let squareSize = size / this.squares.length;
        this.squares.forEach(row => row.forEach(sqr => sqr.resize(squareSize)));
    }
}