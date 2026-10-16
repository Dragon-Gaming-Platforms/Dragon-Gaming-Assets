export class Player {
    constructor(color) {
        this.color = color;
        this.pieces = [];
    }

    toJSON() {
        let json = {};
        json['color'] = this.color;
        json['pieces'] = this.pieces.map(p => p.toJSON());
        return json;
    }

    addPiece(piece) {
        this.pieces.push(piece);
    }

    hasWon() {
        return this.pieces.every(p => p.isInGoalZone());
    }
}