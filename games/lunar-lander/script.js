let y_speed = 5.00
let gameRunning = false
let landed = false
let fuel = 100
let gameStatus = "Running"
let level = 1
let score = 0

function startGame() {    
    if (level == 1) {
        let gravityInterval = setInterval(gravity, 150)
        let acelerationInterval = setInterval(aceleration, 40)
        let telemetryInterval = setInterval(updatetelemetry, 150)
        gameRunning = true
        hideMenu(true)
        generateTerrain()
        generateLandingZone()
    }
}

function hideMenu(boolean) {
    let menu = document.getElementById("menu")

    if (boolean == true)  {
        menu.style.display = "none"
    } else {
        menu.style.display = "flex"
    }
}



function resetGame() {
    let character = document.getElementById("character")
    character.style.left = "40px"    
    character.style.top = "40px"
    fuel = 100
    y_speed = 0
    level = 1
    gameStatus = "Paused"
    resetTerrainGenerated()
    gameRunning = false
}

document.addEventListener('keydown', event => {    
    if (event.code == "ArrowRight") {
        control("right")
    } else if (event.code == "ArrowLeft") {
        control("left")
    } else if (event.code == "ArrowUp") {
        control("up")
    }
})

function control(direction) {
    let character = document.getElementById("character")
    let position_x = getComputedStyle(character).left
    let position_y = getComputedStyle(character).top
    
    let int_position_x = parseInt(position_x.replace("px", ""))
    let int_position_y = parseInt(position_y.replace("px", ""))
    
    let move_speed = 20
    switch (direction) {
        case "left":
            if (checkCollision() == false && isFueled() == true && gameRunning == true && int_position_x != 0) {
                character.style.left = int_position_x - move_speed + "px"
                fuel -= 2
            }
            break
        case "right":
            if (checkCollision() == false && isFueled() == true && gameRunning == true && int_position_x != 580) {
                character.style.left = int_position_x + move_speed + "px"
                fuel -= 2
            }
            break
        case "up":
            if (checkCollision() == false && isFueled() == true && gameRunning == true) {
                y_speed -= 1
                fuel -= 2
                character.style.backgroundImage = "url('assets/landeron.png')"
                let timesRun = 0
                var image_interval = setInterval(function() {
                    character.style.backgroundImage = "url('assets/landeron.png')"
                    timesRun += 1
                    if (timesRun == 9) {
                        character.style.backgroundImage = "url('assets/landeroff.png')"
                        clearInterval(image_interval)
                    }
                }, 100)
            }
            break
    }
}

function isFueled() {
    if (fuel > 0) {
        return true
    }
    else {
        return false
    }
}

function gravity() {
    if (gameRunning) {
        let character = document.getElementById("character")
        
        let position_y = getComputedStyle(character).top
        let int_position_y = parseInt(position_y.replace("px", ""))
        
        if (checkCollision() == false) {
            if (y_speed > 0) {
                character.style.top = int_position_y + y_speed + "px"
            }
            else {
                y_speed += 0.25
                character.style.top = int_position_y + y_speed + "px"
            }
        } else {
            gameRunning = false
            landed = true
            verifyGameOver(y_speed, checkLandingSpot(), character.style.top.replace("px", ""))
            y_speed = 0
        }
    }
}

function verifyGameOver(totalSpeed, landingZone, position_y) {
    if (totalSpeed > 1.5 && position_y > 340) {
        gameStatus = "lose"
        showGameOverMessage(true)
        setTimeout(() => {
            hideMenu(false)
            showGameOverMessage(false)
            location.reload()
        }, 2500);
    } else if (landingZone == "true" && totalSpeed < 1.5 && position_y > 340) {
        gameStatus = "win"
        nextLevel()
    } else {
        gameStatus = "lose"
        showGameOverMessage(true)
        setTimeout(() => {
            hideMenu(false)
            showGameOverMessage(false)
            location.reload()
        }, 2500);
    }
}

function aceleration() {  
    if (gameRunning) {
        let character = document.getElementById("character")
        let position_y = getComputedStyle(character).top
        let int_position_y = parseInt(position_y.replace("px", "")) 
        
        if (y_speed < 10 && !checkCollision()) {
            y_speed += 0.05
        }
    }
}

function updatetelemetry() {
    let textSpeed = document.getElementById("speed-panel")
    let textFuel = document.getElementById("fuel-panel")
    let textStatus = document.getElementById("status-panel")
    let textLevel = document.getElementById("level-panel")
    let textScore = document.getElementById("score-panel")
    
    if (y_speed > 1.5) { 
        textSpeed.style.color = "Red"
    } else {
        textSpeed.style.color = "#9dfc51"
    }
    textSpeed.textContent = "Speed: " + y_speed.toFixed(2)
    textFuel.textContent = "Fuel: " + fuel + "%"
    textStatus.textContent = "Status: " + gameStatus
    textLevel.textContent = "Level: " + level
    textScore.textContent = "Score: " + score
}

function checkCollision() {
    let character = document.getElementById("character")
    
    let characterRect = character.getBoundingClientRect()

    if (character.style.top.replace("px", "") <= -50) {
        return true
    }

    const colecao = document.getElementsByClassName("block")
    for (block of colecao) { 
        let blockRect = block.getBoundingClientRect()
        
        if (characterRect.left < blockRect.right && characterRect.right > blockRect.left) {
            if (characterRect.bottom > blockRect.top) {
                return true
            }
        
        } else {
        }
    }
    return false

}

function generateTerrain() {
    let terrain = document.getElementById("terrain")
    
    for (let i = 0; i<15; i++) {
        let bloco = document.createElement('div')
        bloco.classList.add("block")
        bloco.style.width = '40px'
        bloco.style.height = (20 + Math.random()*10) +'px'
        bloco.style.backgroundColor = "gray"
        
        bloco.style.position = "absolute"
        
        bloco.style.left = i*40 + "px"
        bloco.style.bottom = 50 + "px"

        bloco.setAttribute('landing-zone','false')
        
        terrain.appendChild(bloco)
    }
}

function generateLandingZone() {
    let blockCollection = document.getElementsByClassName("block")
    
    let zoneQuantity = 7 - level
    if (zoneQuantity < 1) {
        zoneQuantity = 1
    }

    let zoneGenerated = 0
    
    for (block of blockCollection) {
        if (zoneGenerated < zoneQuantity) {
            if (Math.floor(Math.random() * 10) < 5) {
                block.style.backgroundColor = "green"
                zoneGenerated += 1
                block.setAttribute('landing-zone', 'true')
            }
        }
    }
    if (zoneGenerated < zoneQuantity) {
        if (zoneGenerated < zoneQuantity) {
            if (Math.floor(Math.random() * 10) < 5) {
                block.style.backgroundColor = "green"
                zoneGenerated += 1
                block.setAttribute('landing-zone', 'true')
            }
        }
    }
    
    let intervalCount = 0
    let hideLandingZone = setInterval(function() {
        if (intervalCount < 5) {
            intervalCount += 1
        } else {
            clearInterval(hideLandingZone)
            for (block of blockCollection) {
                block.style.backgroundColor = "gray"
            }
        }
    }, (200));
}

function resetLandingZone() {
    let blockCollection = document.getElementsByClassName("block")
    for (block of blockCollection) {
        block.setAttribute('landing-zone', 'false')
    }
}

function resetTerrainGenerated() {
    let terrain = document.getElementById("terrain")
    terrain.innerText = ""
}

function checkLandingSpot() {
    let character = document.getElementById("character")
    let blockCollection = document.getElementsByClassName("block")
    let characterRect = character.getBoundingClientRect()

    for (block of blockCollection) {
        blockRect = block.getBoundingClientRect()
        
        
        if (characterRect.left < blockRect.right && characterRect.right > blockRect.left) {
            if (block.getAttribute("landing-zone") == "true") {
                return "true"
            } else {
                return "false"
            }
            
        }
    }
}

function nextLevel() {
    let character = document.getElementById("character")
    level += 1
    score += 100 + fuel
    setTimeout(function() {
        resetLandingZone()
        character.style.top = "40px"
        character.style.left = "40px"
        y_speed = 5
        fuel = 100
        gameRunning = true
        gameStatus = "Running"
        generateLandingZone()
    }, 1000)


}

function showGameOverMessage(boolean) {
    let gameOverMenu = document.getElementById("game-over-menu")
    if (boolean == true) {
        gameOverMenu.style.display = "flex"
    } else {
        gameOverMenu.style.display = "none"
    }
}

function showHowToPlay(boolean) {
    let howToPlay = document.getElementById("container-how-to-play")
    let menu = document.getElementById("menu")
    if (boolean == true) {
        menu.style.display = "none"
        howToPlay.style.display = "flex"
    } else {
        howToPlay.style.display = "none"
        menu.style.display = "flex"
    }
}
