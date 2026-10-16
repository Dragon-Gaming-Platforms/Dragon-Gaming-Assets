export class Square {
    constructor(board, [x, y], onSquareClick) {
        this.board = board;
        this.position = [x, y];
        this.goalZone = undefined;
        this.td = document.createElement('td');
        this.td.addEventListener('click', this.onTDClick.bind(this));
        this.onSquareClick = onSquareClick;
    }

    getElement() {
        return this.td;
    }

    containsPiece() {
        if (this.td.firstChild)
            return true;
        return false;
    }

    getPosition() {
        return this.position;
    }

    setGoalZone(color) {
        this.goalZone = color;
        this.td.setAttribute('class', 'camp');
    }

    getGoalZone() {
        return this.goalZone;
    }

    isGoalZone(piece) {
        return this.goalZone === piece.color;
    }

    onTDClick(e) {
        e.stopPropagation();
        this.onSquareClick(this);
    }

    resize(size) {
        this.td.style.width = `${size}px`;
        this.td.style.height = `${size}px`;
    }

    absDistance(otherSquare) {
        return this.distance(otherSquare).map(x => Math.abs(x));
    }

    distance(otherSquare) {
        return [
            this.getPosition()[0] - otherSquare.getPosition()[0],
            this.getPosition()[1] - otherSquare.getPosition()[1]
        ]
    }

    // Yields horizontal, vertical and diagonal neighbours of the 
    // square that are given distance away.
    * getNeighbours(distance = 1) {
        distance = distance > 0 ? distance : 1;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0)
                    continue;
                let sqr = this.board.getSquare([
                    this.getPosition()[0] + j * distance,
                    this.getPosition()[1] + i * distance
                ]);
                if (sqr)
                    yield sqr;
            }
        }
    }
}