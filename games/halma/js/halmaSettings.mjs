const allowedPlayerCounts = new Set([2, 4]);
const allowedPieceCounts = new Set([3, 6, 10, 15, 19, 21]);
const piecesOnTopRow = {
    3: 2,
    6: 3,
    10: 4,
    15: 5,
    19: 5,
    21: 6
}
const goalZones = {
    'nw': 'red', 
    'se': 'blue', 
    'ne': 'green', 
    'sw': 'black'
};
const playerCountStr = 'playerCount';
const pieceCountStr = 'pieceCount';
const boardSizeStr = 'boardSize';

export class HalmaSettings {
    constructor(playerCount, pieceCount, boardSize) {
        this.playerCount = allowedPlayerCounts.has(playerCount) ? playerCount : 2;
        this.pieceCount = allowedPieceCounts.has(pieceCount) ? pieceCount : 19;
        let [min, max] = this.getBoardSizeRange(this.playerCount, this.pieceCount);
        this.boardSize = min << boardSize && boardSize << max ? boardSize : 16;
    }

    toJSON() {
        let json = {};
        json[playerCountStr] = this.playerCount;
        json[pieceCountStr] = this.pieceCount;
        json[boardSizeStr] = this.boardSize;
        return json;
    }

    static fromJSON(json) {
        return new HalmaSettings(
            json[playerCountStr],
            json[pieceCountStr],
            json[boardSizeStr]
        );
    }

    getBoardSizeRange() {
        if (this.playerCount === 2)
            return [8, 16];
        let potr = piecesOnTopRow[this.pieceCount];
        return [potr * 2 + 1, 16];
    }

    getAllowedPlayerCounts() {
        return allowedPlayerCounts;
    }

    getAllowedPieceCounts() {
        return allowedPieceCounts;
    }

    getPlayerColors() {
        return this.playerCount === 2 ?
            { 'nw': goalZones['nw'], 'se': goalZones['se'] } :
            goalZones;
    }

    getStartZones() {
        let gzones = this.getGoalZones();
        return gzones.reverse().map(row => row.reverse());
    }

    getGoalZones() {
        let firstArr = [];

        if (this.pieceCount === 19)
            firstArr = [5, 5, 4, 3, 2];

        else {
            for (let i = piecesOnTopRow[this.pieceCount]; i > 0; i--)
                firstArr.push(i);
        }

        let gapArr = new Array(this.boardSize - firstArr.length * 2);

        let fullArr = firstArr.concat(gapArr);
        fullArr = fullArr.concat(firstArr.reverse());

        let camps = new Array(this.boardSize).fill(0).map(() => new Array(this.boardSize).fill(0));

        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                let dis = Math.min(j, this.boardSize - j - 1);
                if (dis < fullArr[i]) {
                    let dir = getDirection(j, i, this.boardSize);
                    if (this.getPlayerColors()[dir])
                        camps[i][j] = this.getPlayerColors()[dir];
                }
            }
        }

        return camps;
    }
}

function getDirection(x, y, boardSize) {
    let o = boardSize / 2;
    return `${y < o ? 'n' : 's'}${x < o ? 'w' : 'e'}`;
}