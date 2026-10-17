export class Move {
    constructor(piece, targetSquare) {
        this.piece = piece;
        this.curSquare = piece.getSquare();
        this.targetSquare = targetSquare;

        this.canJumpAgain = false;
        this.jump = false;
        this.valid = 
            this.isTargetEmpty() &&
            !this.isMoveAwayFromGoal() &&
            this.isDistanceValid()

        if (this.valid && this.jump)
            this.canJumpAgain = this.checkCanJumpAgain();
    }

    isTargetEmpty() {
        return !this.targetSquare.containsPiece();
    }

    isMoveAwayFromGoal() {
        return this.curSquare.isGoalZone(this.piece) && 
            !this.targetSquare.isGoalZone(this.piece);
    }

    isDistanceValid() {
        let absDistance = this.curSquare.absDistance(
            this.targetSquare);
        if (Math.max(...absDistance) === 1)
            return true;
        this.jump = canJump(this.curSquare, this.targetSquare);
        return this.jump;
    }

    checkCanJumpAgain() {
        // TODO should also check that the continuation move
        // is not away from goal
        let neighbours = this.targetSquare.getNeighbours(2);
        for (let newTarget of neighbours) {
            if (canJump(this.targetSquare, newTarget))
                return true;
        }
        return false;
    }

    isValid() {
        return this.valid;
    }

    isJump() {
        return this.jump
    }

    canJumpAgain() {
        return this.canJumpAgain;
    }

    execute() {
        if (this.valid)
            this.piece.place(this.targetSquare);
    }
}


function canJump(curSquare, targetSquare) {
    if (targetSquare.containsPiece())
        return false;
    let absDistance = curSquare.absDistance(targetSquare);

    if (Math.max(...absDistance) === 2 && Math.min(...absDistance) !== 1) {
        let gapSquare = getSquareBetween(curSquare, targetSquare);
        if (gapSquare.containsPiece())
            return true;
    }
    return false;
}

// Returns the square between two squares.
function getSquareBetween(square1, square2) {
    let gapPos = [
        (square1.getPosition()[0] + square2.getPosition()[0]) / 2,
        (square1.getPosition()[1] + square2.getPosition()[1]) / 2
    ];
    return square1.board.getSquare(gapPos);
}