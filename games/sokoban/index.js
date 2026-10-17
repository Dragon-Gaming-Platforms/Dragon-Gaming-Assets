// Adapted for static hosting, 2026-10-17: lifecycle, completion and touch controls.
let activeGame = null;
function startGame(difficulty) {
    document.querySelector('.board').innerHTML = '';
    document.querySelector('.menu').classList.add('hidden');
    document.getElementById('controls').hidden = false;
    document.getElementById('moves').textContent = '0';
    activeGame = new Game(difficulty);
    activeGame.difficulty = difficulty;
}
function movePlayer(key) {
    if (activeGame && !activeGame.finished) activeGame.player.move(key, activeGame);
}
for (const button of document.querySelectorAll('.menu_button')) {
    button.addEventListener('click', () => startGame(button.textContent));
}
document.addEventListener('keydown', event => {
    if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.startsWith('Arrow') && activeGame) {
        event.preventDefault();
        movePlayer(event.key);
    }
});
for (const button of document.querySelectorAll('[data-key]')) {
    button.addEventListener('click', () => movePlayer(button.dataset.key));
}
document.getElementById('restart').addEventListener('click', () => startGame(activeGame.difficulty));
document.getElementById('levels').addEventListener('click', () => {
    activeGame = null;
    document.querySelector('.board').innerHTML = '';
    document.querySelector('.menu').classList.remove('hidden');
    document.getElementById('controls').hidden = true;
});

const easy = [
        "WWWWWWWW",
        "WWWWFFFW",
        "WWFCFFFW",
        "WWFWFFTW",
        "WFFTWWWW",
        "WFWCFFWW",
        "WPCFWFWW",
        "WFTFFFWW",
        "WWWWWWWW"
    ];

const medium = [
        "WWWWWWWW",
        "WWWTFWWW",
        "WWWTFPWW",
        "WWWFCFWW",
        "WFFCWWWW",
        "WFWFWWWW",
        "WFFFWWWW",
        "WWWWWWWW"
    ];

const hard = [
        "WWWWWWWWW",
        "WWWWWFFFW",
        "WWFFFCFFW",
        "WWFFWTTFW",
        "WFFCWWWWW",
        "WTCPWWWWW",
        "WWWWWWWWW"
    ];



class Thing{
    constructor(posx,posy,tile){
        this.posx = posx;
        this.posy = posy;
        this.tile = tile;
    }
    render(){
        if(this.renderClass!=""){
            const img = document.createElement('div');
            img.className = this.renderClass;
            this.tile.append(img);
        }

    }

    clear(){
        this.tile.innerHTML = "";
    }
}

class Wall extends Thing{
    constructor(posx,posy){
        super(posx,posy);
        this.renderClass="wall";
    }
}


class Movable extends Thing{

    constructor(posx,posy){
        super(posx,posy);
    }

    move(key,game){

        if (game.finished) return false;
        let newposx = this.posx;
        let newposy = this.posy;
        switch(key){
            case "ArrowUp":
                newposy-=1;
                break;
            case "ArrowDown":
                newposy+=1;
                break;
            case "ArrowLeft":
                newposx-=1;
                break;
            case "ArrowRight":
                newposx+=1;
                break;
        }
        const destination = game.boardmap[newposy][newposx];
        if(destination===null){
            if(this instanceof Crate){

                let selector ='div[data-x="' + this.posx +'"][data-y="' +this.posy+ '"].target';
                let target = document.querySelector(selector);
                if(target != null){
                    game.crates++;
                }
                selector ='div[data-x="' + newposx +'"][data-y="' +newposy+ '"].target';
                target = document.querySelector(selector);
                if(target != null){
                    game.crates--;

                }

            }
            if(this instanceof Player)
                game.movesCount++;
            this.clear();
            game.boardmap[newposy][newposx] = this;
            const selector ='div[data-x="' + newposx +'"][data-y="' +newposy+ '"]';
            this.tile = document.querySelector(selector);
            game.boardmap[this.posy][this.posx] = null;
            this.posx=newposx;
            this.posy=newposy;
            this.render();
            if (this instanceof Player) {
                document.getElementById('moves').textContent = game.movesCount;
                if (game.crates === 0) game.finish();
            }
            return true;
        }
        else if(destination instanceof Crate && !(this instanceof Crate))   {
            if(destination.move(key,game)){
                this.move(key,game);
                return true;
            }
        }
        return false;

    }
}

class Player extends Movable{
    constructor(posx,posy){
        super(posx,posy);
        this.renderClass="player";
    }


}

class Crate extends Movable{
    constructor(posx,posy){
        super(posx,posy);
        this.renderClass="crate";
    }


}

class Game{

    constructor(difficulty){
        let map;
        switch(difficulty){
            case "Easy":
                map = easy;
                break;
            case "Medium":
                map = medium;
                break;
            case "Hard":
                map = hard;
                break;
            default:
        }
        this.sizex=map[0].length;
        this.sizey=map.length;
        this.crates=0;
        this.movesCount = 0;
        //read map global variable
        const board = document.querySelector('.board');
        this.boardmap = [];
        for (let indey = 0; indey < this.sizey; indey++) {
            //
            const row = document.createElement('div');
            row.classList.add("row");
            board.append(row);
            const rowmap = []
            for (let index = 0; index < this.sizex; index++) {
                const tile = document.createElement('div');
                tile.setAttribute('data-x',index.toString());
                tile.setAttribute('data-y',indey.toString());
                tile.classList.add("floor");
                let thing = null;
                switch(map[indey].charAt(index)){
                    case "W":
                        thing = new Wall(index,indey);
                        break;
                    case "C":
                        thing = new Crate(index,indey);
                        this.crates++;
                        break;
                    case "T":
                        tile.classList.remove("floor");
                        tile.classList.add("target");
                        break;
                    case "P":
                        thing = new Player(index,indey);
                        this.player = thing;
                    break;
                }
                rowmap[index] = thing;
                row.append(tile);
                if(thing!=null){
                    thing.tile = tile;
                    thing.render();
                }

            }

            this.boardmap[indey] = rowmap;
        }
    }

    finish(){
        this.finished = true;

        const board = document.querySelector('.board');
        board.innerHTML="<h1>Congratulations! You Won :D</h1><h2>You beat this level with " + this.movesCount + " moves!</h2><p>Choose Restart to try again, or Levels for another puzzle.</p>";
    }


}
