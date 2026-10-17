const xmlns = "http://www.w3.org/2000/svg";

export class Piece {
    constructor(color, onPieceSelected) {
        this.color = color;
        this.onSelected = onPieceSelected;
        this.square = undefined;
        this.chosen = false;

        this.svg = document.createElementNS(xmlns, 'svg');
        this.svg.setAttribute('viewBox', '0 0 100 100');
        this.svg.setAttribute('class', color);

        this.circle = document.createElementNS(xmlns, 'circle');
        this.circle.setAttributeNS(null, 'r', 45);
        this.circle.setAttributeNS(null, 'cx', 50);
        this.circle.setAttributeNS(null, 'cy', 50);
        this.circle.setAttributeNS(null, 'fill', color);
        this.circle.setAttributeNS(null, 'stroke', '#343538');
        this.circle.setAttributeNS(null, 'stroke-width', 4);
        this.svg.appendChild(this.circle);
        this.circle.addEventListener('click', this.onCircleClick.bind(this), false);
    }

    toJSON() {
        return {
            'chosen': this.chosen,
            'color': this.color,
            'position': this.getSquare().getPosition()
        };
    }

    place(square) {
        if (square.containsPiece())
            throw 'Square already contains a piece';
        this.square = square;
        square.getElement().appendChild(this.svg);
    }

    isInGoalZone() {
        return this.getSquare().isGoalZone(this);
    }

    getSquare() {
        return this.square;
    }

    onCircleClick(e) {
        e.stopPropagation();
        this.onSelected(this);
    }

    highlight(b) {
        if (b) {
            this.circle.setAttributeNS(null, 'stroke', '#FFD635');
            this.circle.setAttributeNS(null, 'stroke-width', 8);
            this.chosen = true;
        }
        else {
            this.circle.setAttributeNS(null, 'stroke', '#343538');
            this.circle.setAttributeNS(null, 'stroke-width', 4);
            this.chosen = false;
        }
    }
}
