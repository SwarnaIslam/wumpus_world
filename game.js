const player = document.getElementById('player');
const wumpus = document.getElementById('wumpus');
const pit1 = document.getElementById('pit1');
const pit2 = document.getElementById('pit2');
const pit3 = document.getElementById('pit3');
const gridContainer = document.getElementById('grid-container');
const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');
const upButton = document.getElementById('up');
const downButton = document.getElementById('down');
const shootButton = document.getElementById('shoot');
const scoreDisplay = document.getElementById('score');
const arrowsDisplay = document.getElementById('arrows');
const messageDisplay = document.getElementById('message');
const placeBridgeButton = document.getElementById('placeBridge');

let playerPosition = { x: 0, y: 0 };
let wumpusPosition = { x: 0, y: 0 };
let score = 0;
let arrows = 3;
let pits = [];
let bridges = [];

// Initialize the grid
for (let i = 0; i < 100; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.setAttribute('data-x', i % 10);
    cell.setAttribute('data-y', Math.floor(i / 10));
    gridContainer.appendChild(cell);
}

// Place the player, wumpus, and pits randomly
function placeRandomElement(element, position) {
    const randomX = Math.floor(Math.random() * 10);
    const randomY = Math.floor(Math.random() * 10);
    position.x = randomX;
    position.y = randomY;
    element.style.left = randomX * 52 + 'px';
    element.style.top = randomY * 53.5 + 'px';
}

function updateScore() {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateArrows() {
    arrows--;
    arrowsDisplay.textContent = `Arrows: ${arrows}`;
}

function checkCollision(position1, position2) {
    return position1.x === position2.x && position1.y === position2.y;
}

function checkPitCollisions() {
    for (const pitPosition of pits) {
        if (checkCollision(playerPosition, pitPosition)) {
            return true; // Collision detected
        }
    }
    return false; // No collision with any pit
}

function movePlayer(direction) {
    console.log('Player moved')
    if (messageDisplay.textContent !== '') {
        return; // Don't move if the game is over
    }

    switch (direction) {
        case 'left':
            if (playerPosition.x > 0) {
                playerPosition.x--;
            }
            break;
        case 'right':
            if (playerPosition.x < 9) {
                playerPosition.x++;
            }
            break;
        case 'up':
            if (playerPosition.y > 0) {
                playerPosition.y--;
            }
            break;
        case 'down':
            if (playerPosition.y < 9) {
                playerPosition.y++;
            }
            break;
    }

    if (checkCollision(playerPosition, wumpusPosition)) {
        messageDisplay.textContent = 'You encountered the Wumpus! Game Over';
        alert(messageDisplay.textContent)
        return;
    } else if (checkPitCollisions()) {
        if (cellContainsBridge(playerPosition.x, playerPosition.y)) {
            // If the player has a bridge, remove it and continue
            removePit(playerPosition.x, playerPosition.y);
        } else {
            messageDisplay.textContent = 'You fell into a pit! Game Over';
            alert(messageDisplay.textContent);
            return;
        }
    }

    updatePlayerPosition();
    updateScore();
}

function shootArrow() {
    if (messageDisplay.textContent !== '') {
        return;
    }

    if (arrows > 0) {
        updateArrows();
        if (checkCollision(playerPosition, wumpusPosition)) {
            messageDisplay.textContent = 'You shot the Wumpus and won! Game Over';
            alert(messageDisplay.textContent)
            return;
        } else {
            const direction = prompt('Enter the direction to shoot (left, right, up, down):');
            if (direction) {
                // Calculate the new position based on the direction
                const newPosition = { ...playerPosition };
                switch (direction) {
                    case 'left':
                        newPosition.x--;
                        break;
                    case 'right':
                        newPosition.x++;
                        break;
                    case 'up':
                        newPosition.y--;
                        break;
                    case 'down':
                        newPosition.y++;
                        break;
                    default:
                        alert('Invalid direction. Use left, right, up, or down.');
                        return;
                }

                // Check if the arrow hit the Wumpus
                if (checkCollision(newPosition, wumpusPosition)) {
                    messageDisplay.textContent = 'You shot the Wumpus and won! Game Over';
                    alert(messageDisplay.textContent)
                } else {
                    messageDisplay.textContent = 'You missed the Wumpus.';
                    alert(messageDisplay.textContent)
                }
            }
        }
    } else {
        alert('Out of arrows!');
    }
}

leftButton.addEventListener('click', () => movePlayer('left'));
rightButton.addEventListener('click', () => movePlayer('right'));
upButton.addEventListener('click', () => movePlayer('up'));
downButton.addEventListener('click', () => movePlayer('down'));
shootButton.addEventListener('click', shootArrow);

function updatePlayerPosition() {
    player.style.left = playerPosition.x * 52 + 'px';
    player.style.top = playerPosition.y * 53.5 + 'px';

    const currentCell = document.querySelector(`#grid-container > .grid-cell[data-x="${playerPosition.x}"][data-y="${playerPosition.y}"]`);

    if (!currentCell.classList.contains('visited')) {
        currentCell.style.backgroundColor = '#fff'; // Brown for unvisited cells
        currentCell.classList.add('visited');
    }

    player.style.transform = 'translate(+75%, +75%)'; // Center the player in the cell

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const cellX = playerPosition.x + dx;
            const cellY = playerPosition.y + dy;
            const cell = document.querySelector(`#grid-container > .grid-cell[data-x="${cellX}"][data-y="${cellY}"]`);

            if (checkCollision({ x: cellX, y: cellY }, wumpusPosition)) {
                cell.textContent = "Stench";
            }
        }
    }
}

function placeRandomElementAvoidingAdjacent(element, position, avoidPositions) {
    let randomX, randomY;
    do {
        randomX = Math.floor(Math.random() * 10);
        randomY = Math.floor(Math.random() * 10);
    } while (avoidPositions.some(avoidPos => Math.abs(randomX - avoidPos.x) <= 0 && Math.abs(randomY - avoidPos.y) <= 0));

    position.x = randomX;
    position.y = randomY;
    element.style.left = randomX * 52 + 'px';
    element.style.top = randomY * 53.5 + 'px';
}


// Initialize the game
function initializeGame() {

    const avoidPositions = [];

    avoidPositions.push({ x: playerPosition.x, y: playerPosition.y });
    avoidPositions.push({ x: playerPosition.x + 1, y: playerPosition.y });
    avoidPositions.push({ x: playerPosition.x, y: playerPosition.y + 1 });
    avoidPositions.push({ x: playerPosition.x + 1, y: playerPosition.y + 1 });
    avoidPositions.push({ x: playerPosition.x + 2, y: playerPosition.y });
    avoidPositions.push({ x: playerPosition.x, y: playerPosition.y + 2 });
    avoidPositions.push({ x: playerPosition.x + 2, y: playerPosition.y + 2 });

    // Place the Wumpus
    placeRandomElementAvoidingAdjacent(wumpus, wumpusPosition, avoidPositions);
    avoidPositions.push({ x: wumpusPosition.x, y: wumpusPosition.y });

    wumpus.style.transform = 'translate(+75%, +75%)';

    const numberOfPits = 20;
    for (let i = 0; i < numberOfPits; i++) {
        const pitPosition = { id: `${i}` };
        placeRandomElementAvoidingAdjacent(document.createElement('div'), pitPosition, avoidPositions);
        avoidPositions.push({ x: pitPosition.x, y: pitPosition.y });
        const pit = document.createElement('div');
        pit.className = 'pit';
        pit.id = i;
        pit.style.left = pitPosition.x * 52 + 'px';
        pit.style.top = pitPosition.y * 53.5 + 'px';
        pit.style.transform = 'translate(+75%, +75%)';
        gridContainer.appendChild(pit);
        pits.push(pitPosition);
    }

    // Display stench text in the cells around the Wumpus at the beginning
    const surroundingCells = [
        { dx: 0, dy: -1 }, // Above
        { dx: 0, dy: 1 },  // Below
        { dx: -1, dy: 0 }, // Left
        { dx: 1, dy: 0 }   // Right
    ];

    for (const { dx, dy } of surroundingCells) {
        const cellX = wumpusPosition.x + dx;
        const cellY = wumpusPosition.y + dy;

        // Check if the cell is within the grid boundaries
        if (cellX >= 0 && cellX < 10 && cellY >= 0 && cellY < 10 && !pits.some(pit => pit.x === cellX && pit.y === cellY)) {
            const cell = document.querySelector(`#grid-container > .grid-cell[data-x="${cellX}"][data-y="${cellY}"]`);
            cell.textContent = "Stench";
        }
    }

    // Display bridge text around the pits at the beginning

    for (const pitPosition of pits) {
        const surroundingCellsPit = [
            { dx: 0, dy: -1 }, // Above
            { dx: 0, dy: 1 },  // Below
            { dx: -1, dy: 0 }, // Left
            { dx: 1, dy: 0 }   // Right
        ];

        for (const { dx, dy } of surroundingCellsPit) {
            const cellX = pitPosition.x + dx;
            const cellY = pitPosition.y + dy;

            // Check if the cell is within the grid boundaries
            if (
                cellX >= 0 && cellX < 10 &&
                cellY >= 0 && cellY < 10 &&
                !document.querySelector(`#grid-container > .grid-cell[data-x="${cellX}"][data-y="${cellY}"]`).textContent.includes("Stench") &&
                !document.querySelector(`#grid-container > .grid-cell[data-x="${cellX}"][data-y="${cellY}"]`).textContent.includes("Bridge") &&
                !pits.some(pit => pit.x === cellX && pit.y === cellY) &&
                !(cellX === wumpusPosition.x && cellY === wumpusPosition.y)
            ) {
                const cell = document.querySelector(`#grid-container > .grid-cell[data-x="${cellX}"][data-y="${cellY}"]`);
                cell.textContent = "Bridge";
            }
        }
    }
}

initializeGame();

updatePlayerPosition();

function placeBridge(position) {
    bridges.push({ x: position.x + 1, y: position.y });
}

function cellContainsBridge(x, y) {
    return bridges.some(bridge => bridge.x === x && bridge.y === y);
}

function removePit(x, y) {
    const index = pits.findIndex(pit => pit.x === x && pit.y === y);
    if (index !== -1) {
        const pitID = pits[index].id;
        const pitElement = document.getElementById(pitID);
        pits.splice(index, 1);

        if (pitElement) {
            pitElement.remove();
        }
    }
}

placeBridgeButton.addEventListener('click', () => {
    if (arrows > 0) {
        const adjacentPit = pits.some(pit => (
            (pit.x === playerPosition.x && Math.abs(pit.y - playerPosition.y) === 1) ||
            (pit.y === playerPosition.y && Math.abs(pit.x - playerPosition.x) === 1)
        ));

        if (adjacentPit) {
            placeBridge(playerPosition);
        } else {
            alert('You can only place a bridge next to a pit.');
        }
    } else {
        alert('Out of arrows!');
    }
});