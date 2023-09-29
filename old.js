const player = document.getElementById('player');
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
let score = 0;
let arrows = 10;
let pits = [];
let wumpuses = [];
let recordedPositions = Array.from({ length: 10 }, () => []);
let possibleMoves = [];
let avoidPositions = [];

// Initialize the grid
for (let i = 0; i < 100; i++) {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    const cell_elements = document.createElement('div');
    cell_elements.className = 'grid-cell-elements';
    cell_elements.setAttribute('data-x', i % 10);
    cell_elements.setAttribute('data-y', Math.floor(i / 10));
    cell.appendChild(cell_elements);
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

function checkWumpusCollisions() {
    for (const wumpusPosition of wumpuses) {
        if (checkCollision(playerPosition, wumpusPosition)) {
            return true; // Collision detected
        }
    }
    return false; // No collision with any pit
}

function makeCellSafe() {

}

function recordPosition(positionX, positionY) {
    const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${positionX}"][data-y="${positionY}"]`);
    const cellExists = recordedPositions[positionY].some(cell => cell.x === positionX && cell.y === positionY);

    if (!cellExists) {
        if (cell.textContent.includes('stench')) {
            recordedPositions[positionY].push({ x: positionX, y: positionY, content: 'stench' });
        }
        else if (cell.textContent.includes('breeze')) {
            recordedPositions[positionY].push({ x: positionX, y: positionY, content: 'breeze' });
        }
        else {
            recordedPositions[positionY].push({ x: positionX, y: positionY, content: 'Empty' });
        }
    }
}

function checkEmptyCell(positionX, positionY) {

    const directions = [
        { dx: -1, dy: 0, move: 'left' },
        { dx: 1, dy: 0, move: 'right' },
        { dx: 0, dy: -1, move: 'up' },
        { dx: 0, dy: 1, move: 'down' },
    ];

    for (const { dx, dy } of directions) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
            const isVisited = recordedPositions[newY].some(cell => cell.x === newX && cell.y === newY);
            const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${newX}"][data-y="${newY}"]`);

            if (isVisited && cell && !cell.textContent) {
                // console.log('Found an Empty Cell at: ', newX, newY, ' for cell: ', positionX, positionY);
                const cellIndex = possibleMoves.findIndex(cell => cell.x === positionX && cell.y === positionY);

                // console.log(cellIndex, dx, dy);

                possibleMoves[cellIndex].danger = 0;
            }
        }
    }
}

function checkStenchAndBreezeCombinationAroundCells(positionX, positionY) {
    const directions = [
        { dx: -1, dy: 0, move: 'left' },
        { dx: 1, dy: 0, move: 'right' },
        { dx: 0, dy: -1, move: 'up' },
        { dx: 0, dy: 1, move: 'down' },
    ];

    let breezeExists = false;
    let stenchExists = false;

    for (const { dx, dy } of directions) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
            const isVisited = recordedPositions[newY].some(cell => cell.x === newX && cell.y === newY);
            const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${newX}"][data-y="${newY}"]`);

            if (isVisited && cell && cell.textContent) {

                if (cell.textContent.includes('stench')) {
                    stenchExists = true;
                    // console.log('Stench: ', newX, newY);
                }
                else if (cell.textContent.includes('breeze')) {
                    breezeExists = true;
                    // console.log('Breeze: ', newX, newY);
                }

                if (cell.textContent.includes('breeze') && cell.textContent.includes('stench')) {
                    breezeExists = false;
                    stenchExists = false;
                    break;
                }
            }
        }
    }

    if (stenchExists && breezeExists) {
        // console.log('Found an Cobiined Cell for: ', positionX, positionY);
        const cellIndex = possibleMoves.findIndex(cell => cell.x === positionX && cell.y === positionY);

        possibleMoves[cellIndex].danger = 0;
    }
}

function markSafeCells(positionX, positionY) {
    const directions = [
        { dx: -1, dy: 0, move: 'left' },
        { dx: 1, dy: 0, move: 'right' },
        { dx: 0, dy: -1, move: 'up' },
        { dx: 0, dy: 1, move: 'down' },
    ];

    for (const { dx, dy } of directions) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
            const isVisited = recordedPositions[newY].some(cell => cell.x === newX && cell.y === newY);
            const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${newX}"][data-y="${newY}"]`);

            if (!isVisited && cell) {
                const cellIndex = possibleMoves.findIndex(cell => cell.x === newX && cell.y === newY);
                console.log('marked cell: ', newX, newY)
                possibleMoves[cellIndex].danger = 0;
            }
        }
    }
}

function checkForVisitedCellsAroundBreezesOrPits(positionX, positionY, hintName) {
    const directions = [
        { dx: -1, dy: 0, move: 'left' },
        { dx: 1, dy: 0, move: 'right' },
        { dx: 0, dy: -1, move: 'up' },
        { dx: 0, dy: 1, move: 'down' },
    ];

    let hintCellCount = 0;
    let adjacentCellCount = 0;

    for (const { dx, dy } of directions) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
            const isVisited = recordedPositions[newY].some(cell => cell.x === newX && cell.y === newY);
            adjacentCellCount = adjacentCellCount + 1;

            if (isVisited) {
                const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${newX}"][data-y="${newY}"]`);
                if (cell.textContent.includes(hintName)) {
                    hintCellCount = hintCellCount + 1;
                }
            }
        }
    }

    if (hintCellCount === adjacentCellCount - 1) {
        // console.log('Recorded Position: ', recordedPositions);
        // console.log('Found a sure pit in: ', positionX, positionY, 'for: ', visitedCellCount, adjacentCellCount);
        return true;
    }

    return false;
}

function checkForPitsAndWumpusUsingBreezeAndStench(positionX, positionY) {
    const directions = [
        { dx: -1, dy: 0, move: 'left' },
        { dx: 1, dy: 0, move: 'right' },
        { dx: 0, dy: -1, move: 'up' },
        { dx: 0, dy: 1, move: 'down' },
    ];

    let pitExists = false;
    let wumpusExists = false;

    for (const { dx, dy } of directions) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
            const isVisited = recordedPositions[newY].some(cell => cell.x === newX && cell.y === newY);
            const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${newX}"][data-y="${newY}"]`);

            if (isVisited && cell && cell.textContent) {
                if (checkForVisitedCellsAroundBreezesOrPits(newX, newY, 'breeze')) {
                    pitExists = true;
                }
                else if (checkForVisitedCellsAroundBreezesOrPits(newX, newY, 'stench')) {
                    wumpusExists = true;
                }
            }
        }
    }

    if (pitExists) {
        for (const { dx, dy } of directions) {
            const newX = positionX + dx;
            const newY = positionY + dy;

            if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
                const isVisited = recordedPositions[newY].some(cell => cell.x === newX && cell.y === newY);
                const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${newX}"][data-y="${newY}"]`);

                if (isVisited && cell && cell.textContent) {
                    // markSafeCells(newX, newY);
                }
            }
        }

        const cellIndex = possibleMoves.findIndex(cell => cell.x === positionX && cell.y === positionY);
        possibleMoves[cellIndex].danger = 4;
    }

    if(wumpusExists) {
        const cellIndex = possibleMoves.findIndex(cell => cell.x === positionX && cell.y === positionY);
        possibleMoves[cellIndex].danger = 0;
    }
}

function checkForSafeCells() {
    // console.log('all Possible moves: ', possibleMoves);
    for (const move of possibleMoves) {
        checkForPitsAndWumpusUsingBreezeAndStench(move.x, move.y);
        checkEmptyCell(move.x, move.y);
        checkStenchAndBreezeCombinationAroundCells(move.x, move.y);
    }
}

function checkForWumpus(positionX, positionY) {
    const directions = [
        { dx: -1, dy: 0, move: 'left' },
        { dx: 1, dy: 0, move: 'right' },
        { dx: 0, dy: -1, move: 'up' },
        { dx: 0, dy: 1, move: 'down' },
    ];

    let neighbourCells = 0;
    let stenchCells = 0;

    for (const { dx, dy } of directions) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10 && arrows > 0) {
            neighbourCells = neighbourCells + 1;
            const isVisited = recordedPositions[newY].some(cell => cell.x === newX && cell.y === newY);
            const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${newX}"][data-y="${newY}"]`);

            if (isVisited && cell && cell.textContent) {
                if (cell.textContent.includes('stench')) {
                    stenchCells = stenchCells + 1;
                }
            }
        }
    }

    // console.log(positionX, positionY, stenchCells/neighbourCells);

    if (stenchCells / neighbourCells >= 0.5) {
        const cellIndex = possibleMoves.findIndex(cell => cell.x === positionX && cell.y === positionY);
        possibleMoves[cellIndex].danger = 0;
        possibleMoves[cellIndex].wumpus = 'wumpus_exist';
    }
    else if (stenchCells / neighbourCells > 0) {
        const cellIndex = possibleMoves.findIndex(cell => cell.x === positionX && cell.y === positionY);
        possibleMoves[cellIndex].wumpus = 'possible_wumpus_exist';
    }
    else {
        const cellIndex = possibleMoves.findIndex(cell => cell.x === positionX && cell.y === positionY);
        possibleMoves[cellIndex].wumpus = 'null';
    }
}

function neighbourCellCount(positionX, positionY) {
    const directions = [
        { dx: -1, dy: 0, move: 'left' },
        { dx: 1, dy: 0, move: 'right' },
        { dx: 0, dy: -1, move: 'up' },
        { dx: 0, dy: 1, move: 'down' },
    ];

    let totalNeighbourCellsCount = 0;

    for (const { dx, dy } of directions) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
            totalNeighbourCellsCount = totalNeighbourCellsCount + 1;
        }
    }

    return totalNeighbourCellsCount;
}

function getPossibleMoves(playerX, playerY) {
    const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${playerX}"][data-y="${playerY}"]`);

    // Define the possible directions (left, right, up, down)
    const directions = [
        { dx: -1, dy: 0, move: 'left' },
        { dx: 1, dy: 0, move: 'right' },
        { dx: 0, dy: -1, move: 'up' },
        { dx: 0, dy: 1, move: 'down' },
    ];

    // Check each direction for possible moves
    for (const { dx, dy } of directions) {
        const newX = playerX + dx;
        const newY = playerY + dy;

        // Check if the new position is within the grid boundaries
        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
            const cellIndex = possibleMoves.findIndex(cell => cell.x === newX && cell.y === newY);
            const isVisited = recordedPositions[playerY].some(cell => cell.x === playerX && cell.y === playerY);

            if (!isVisited) {
                if (cell.textContent.includes('stench')) {
                    if (cellIndex !== -1) {
                        possibleMoves[cellIndex].danger = possibleMoves[cellIndex].danger + 2;
                    }
                    else {
                        possibleMoves.push({ x: newX, y: newY, danger: 1, neighbourCells: neighbourCellCount(newX, newY), wumpus: 'null' });
                    }
                }
                else if (cell.textContent.includes('breeze')) {
                    if (cellIndex !== -1) {

                        possibleMoves[cellIndex].danger = possibleMoves[cellIndex].danger + 1;
                    }
                    else {
                        possibleMoves.push({ x: newX, y: newY, danger: 1, neighbourCells: neighbourCellCount(newX, newY), wumpus: 'null' });
                    }
                }
                else if (cell.textContent.includes('breeze') && cell.textContent.includes('stench')) {
                    console.log('got a combine cell');
                    if (cellIndex !== -1) {
                        possibleMoves[cellIndex].danger = possibleMoves[cellIndex].danger + 3;
                    }
                    else {
                        possibleMoves.push({ x: newX, y: newY, danger: 3, neighbourCells: neighbourCellCount(newX, newY), wumpus: 'null' });
                    }
                }
                else if (cellIndex === -1) {
                    possibleMoves.push({ x: newX, y: newY, danger: 0, neighbourCells: neighbourCellCount(newX, newY), wumpus: 'null' });
                }
            }
        }
    }

    recordPosition(playerPosition.x, playerPosition.y);

    // console.log('Recorded move: ', recordedPositions);

    possibleMoves = possibleMoves.filter(cell => !recordedPositions.some(subarray => subarray.some(recordedCell => recordedCell.x === cell.x && recordedCell.y === cell.y)));

    checkForSafeCells();

    // possibleMoves = possibleMoves.filter(cell => cell.danger !== 4);
}

// Define data structures
class Node {
    constructor(x, y, g = 0, h = 0) {
        this.x = x;
        this.y = y;
        this.g = g; // Cost from start to current node
        this.h = h; // Heuristic (estimated cost to target)
    }

    get f() {
        return this.g + this.h;
    }
}

// Calculate Manhattan distance heuristic
function calculateHeuristic(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// A* pathfinding function
function findPath(startX, startY, targetX, targetY) {
    const openList = []; // Priority queue of open nodes
    const closedList = new Set(); // Set of closed nodes

    const startNode = new Node(startX, startY);
    const targetNode = new Node(targetX, targetY);

    openList.push(startNode);

    while (openList.length > 0) {
        // Find the node with the lowest f score in the open list
        const currentNode = openList.reduce((minNode, node) =>
            node.f < minNode.f ? node : minNode, openList[0]);

        // Remove the current node from the open list
        openList.splice(openList.indexOf(currentNode), 1);

        // Add the current node to the closed list
        closedList.add(`${currentNode.x}-${currentNode.y}`);

        // Check if we've reached the target
        if (currentNode.x === targetNode.x && currentNode.y === targetNode.y) {
            const path = [];
            let current = currentNode;

            while (current) {
                path.unshift({ x: current.x, y: current.y });
                current = current.parent;
            }

            return path;
        }

        // Generate neighbor nodes
        const neighbors = [
            { x: currentNode.x - 1, y: currentNode.y },
            { x: currentNode.x + 1, y: currentNode.y },
            { x: currentNode.x, y: currentNode.y - 1 },
            { x: currentNode.x, y: currentNode.y + 1 },
        ];

        for (const neighbor of neighbors) {
            const [nx, ny] = [neighbor.x, neighbor.y];

            // Skip if neighbor is out of bounds or in closed list
            if (
                nx < 0 || nx >= 10 ||
                ny < 0 || ny >= 10 ||
                closedList.has(`${nx}-${ny}`)
            ) {
                continue;
            }

            if (!recordedPositions[ny].some(cell => cell.x === nx && cell.y === ny) && !(nx === targetX && ny === targetY)) {
                continue;
            }

            // Calculate tentative g score
            const gScore = currentNode.g + 1; // Assuming uniform cost

            // Check if neighbor is not in the open list or has a lower g score
            let neighborNode = openList.find(node => node.x === nx && node.y === ny);

            if (!neighborNode || gScore < neighborNode.g) {
                if (!neighborNode) {
                    neighborNode = new Node(nx, ny);
                    openList.push(neighborNode);
                }

                neighborNode.parent = currentNode;
                neighborNode.g = gScore;
                neighborNode.h = calculateHeuristic(nx, ny, targetX, targetY);
            }
        }
    }
}


function movePlayer(direction) {
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

    updatePlayerPosition();
    updateScore();

    const nextBestMove = selectBestPath(playerPosition.x, playerPosition.y);
    // console.log('Next move: ', nextBestMove);

    const path = findPath(playerPosition.x, playerPosition.y, nextBestMove.x, nextBestMove.y);
    // console.log('Path to next Move: ', path);

    const nextMove = path[1];

    const nextMoveDirection = [
        { dx: -1, dy: 0, move: 'left' },
        { dx: 1, dy: 0, move: 'right' },
        { dx: 0, dy: -1, move: 'up' },
        { dx: 0, dy: 1, move: 'down' },
    ];

    for (const { dx, dy, move } of nextMoveDirection) {
        const newX = playerPosition.x + dx;
        const newY = playerPosition.y + dy;

        if (newX === nextMove.x && newY === nextMove.y) {
            if (nextBestMove.wumpus === 'wumpus_exist' && nextMove.x === nextBestMove.x && nextMove.y === nextBestMove.y) {
                setTimeout(() => {
                    shootArrow(nextBestMove);
                    // console.log(nextBestMove);
                    movePlayer(move);
                }, 1000);
                break;
            }
            // else if (nextBestMove.wumpus === 'possible_wumpus_exist' && nextMove.x === nextBestMove.x && nextMove.y === nextBestMove.y) {
            //     setTimeout(() => {
            //         shootArrow(nextBestMove);
            //         // console.log(nextBestMove);
            //         movePlayer(move);
            //     }, 1000);
            //     break;
            // }
            else {
                setTimeout(() => {
                    // console.log(nextBestMove);
                    movePlayer(move);
                }, 100);
                break;
            }
        }
    }

    if (checkWumpusCollisions()) {
        messageDisplay.textContent = 'You were encountered by wumpus! Game Over';
        alert(messageDisplay.textContent);
    } else if (checkPitCollisions()) {
        messageDisplay.textContent = 'You fell into a pit! Game Over';
        alert(messageDisplay.textContent);
    }
}

function updateDangerForStenchNeighbourCells(positionX, positionY) {
    const nextMoveDirection = [
        { dx: -1, dy: 0, move: 'left' },
        { dx: 1, dy: 0, move: 'right' },
        { dx: 0, dy: -1, move: 'up' },
        { dx: 0, dy: 1, move: 'down' },
    ];

    for (const { dx, dy } of nextMoveDirection) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        const existsInPossibleMoves = possibleMoves.some(cell => cell.x === newX && cell.y === newY);

        if (existsInPossibleMoves) {
            const cellIndex = possibleMoves.findIndex(cell => cell.x === newX && cell.y === newY);
            possibleMoves[cellIndex].danger = possibleMoves[cellIndex].danger - 1;
        }
    }
}

function checkIfStenchIsNecessary(positionX, positionY) {
    const nextMoveDirection = [
        { dx: -1, dy: 0, move: 'left' },
        { dx: 1, dy: 0, move: 'right' },
        { dx: 0, dy: -1, move: 'up' },
        { dx: 0, dy: 1, move: 'down' },
    ];

    for (const { dx, dy } of nextMoveDirection) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (
            newX >= 0 && newX < 10 &&
            newY >= 0 && newY < 10
        ) {
            const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${newX}"][data-y="${newY}"]`);

            // Check if the neighboring cell contains a wumpus or pit element
            const hasWumpus = cell.querySelector('.wumpus');

            if (hasWumpus) {
                return true;
            }
        }
    }

    return false;
}

function removeStenches(positionX, positionY) {
    const nextMoveDirection = [
        { dx: -1, dy: 0, move: 'left' },
        { dx: 1, dy: 0, move: 'right' },
        { dx: 0, dy: -1, move: 'up' },
        { dx: 0, dy: 1, move: 'down' },
    ];

    for (const { dx, dy } of nextMoveDirection) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${newX}"][data-y="${newY}"]`);

        if (cell) {
            if (cell.textContent.includes('stench') && !checkIfStenchIsNecessary(newX, newY)) {
                updateDangerForStenchNeighbourCells(newX, newY);
                if (cell.textContent.includes('breeze')) {
                    cell.textContent = 'breeze';
                }
                else {
                    cell.textContent = '';
                }
            }
        }
    }
}

function shootArrow(wumpusPosition) {
    // const nextMoveDirection = [
    //     { dx: -1, dy: 0, move: 'left' },
    //     { dx: 1, dy: 0, move: 'right' },
    //     { dx: 0, dy: -1, move: 'up' },
    //     { dx: 0, dy: 1, move: 'down' },
    // ];

    if (arrows > 0) {
        const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${wumpusPosition.x}"][data-y="${wumpusPosition.y}"]`);
        if (cell) {
            const wumpusElement = cell.querySelector('.wumpus');
            if (wumpusElement) {
                console.log('Wumpus Killed!');
                wumpusElement.remove();

                removeStenches(wumpusPosition.x, wumpusPosition.y);
                wumpuses = wumpuses.filter(cell => cell.x !== wumpusPosition.x && cell.y !== wumpusPosition.y);
            }
        }
        updateArrows();
        console.log(arrows);
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

    const currentCell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${playerPosition.x}"][data-y="${playerPosition.y}"]`);

    currentCell.style.display = 'block';

    player.style.transform = 'translate(+75%, +75%)'; // Center the player in the cell
}

function placeRandomElementAvoidingAdjacent(element, position) {
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

function avoidElementArea(elementPosition) {
    avoidPositions.push({ x: elementPosition.x, y: elementPosition.y });

    avoidPositions.push({ x: elementPosition.x + 1, y: elementPosition.y });
    avoidPositions.push({ x: elementPosition.x - 1, y: elementPosition.y });
    avoidPositions.push({ x: elementPosition.x, y: elementPosition.y + 1 });
    avoidPositions.push({ x: elementPosition.x, y: elementPosition.y - 1 });

    avoidPositions.push({ x: elementPosition.x + 1, y: elementPosition.y + 1 });
    avoidPositions.push({ x: elementPosition.x + 1, y: elementPosition.y - 1 });
    avoidPositions.push({ x: elementPosition.x - 1, y: elementPosition.y + 1 });
    avoidPositions.push({ x: elementPosition.x - 1, y: elementPosition.y - 1 });

    // avoidPositions.push({ x: elementPosition.x + 2, y: elementPosition.y });
    // avoidPositions.push({ x: elementPosition.x - 2, y: elementPosition.y });
    // avoidPositions.push({ x: elementPosition.x, y: elementPosition.y + 2 });
    // avoidPositions.push({ x: elementPosition.x, y: elementPosition.y - 2 });
}

function avoidPlayerArea() {
    avoidPositions.push({ x: playerPosition.x, y: playerPosition.y });
    avoidPositions.push({ x: playerPosition.x + 1, y: playerPosition.y });
    avoidPositions.push({ x: playerPosition.x, y: playerPosition.y + 1 });
    avoidPositions.push({ x: playerPosition.x + 1, y: playerPosition.y + 1 });
    avoidPositions.push({ x: playerPosition.x + 2, y: playerPosition.y });
    avoidPositions.push({ x: playerPosition.x, y: playerPosition.y + 2 });
    avoidPositions.push({ x: playerPosition.x + 2, y: playerPosition.y + 2 });
}

function placeElements(numberOfElements, elementName) {

    for (let i = 0; i < numberOfElements; i++) {
        const elementPosition = { id: `${i}` };
        placeRandomElementAvoidingAdjacent(document.createElement('div'), elementPosition);
        avoidElementArea(elementPosition);
        const element = document.createElement('div');
        element.className = elementName;
        element.id = i;
        element.style.left = elementPosition.x * 52 + 'px';
        element.style.top = elementPosition.y * 53.5 + 'px';
        element.style.transform = 'translate(+75%, +75%)';
        const cell_elements = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${elementPosition.x}"][data-y="${elementPosition.y}"]`);
        cell_elements.appendChild(element);

        if (elementName == 'pit') pits.push(elementPosition);
        else if (elementName == 'wumpus') wumpuses.push(elementPosition);
    }
}

function placeElementHints(elements, hintName) {
    for (const elementPosition of elements) {
        const surroundingCells = [
            { dx: 0, dy: -1 }, // Above
            { dx: 0, dy: 1 },  // Below
            { dx: -1, dy: 0 }, // Left
            { dx: 1, dy: 0 }   // Right
        ];

        for (const { dx, dy } of surroundingCells) {
            const cellX = elementPosition.x + dx;
            const cellY = elementPosition.y + dy;

            // Check if the cell is within the grid boundaries
            if (
                cellX >= 0 && cellX < 10 &&
                cellY >= 0 && cellY < 10
            ) {
                const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${cellX}"][data-y="${cellY}"]`);

                // Check if the neighboring cell contains a wumpus or pit element
                // const hasWumpus = cell.querySelector('.wumpus');
                // const hasPit = cell.querySelector('.pit');

                // if (hasWumpus || hasPit) {
                //     // If there's a wumpus or pit in any neighboring cell, set the flag and break the loop
                //     continue;
                // }


                if (cell.textContent) {
                    if (cell.textContent.includes('breeze') && hintName === 'stench') {
                        cell.textContent = cell.textContent.concat(` ${hintName}`);
                    } else if (cell.textContent.includes('stench') && hintName === 'breeze') {
                        cell.textContent = cell.textContent.concat(` ${hintName}`);
                    }
                } else {
                    cell.textContent = hintName;
                    cell.classList.add(hintName);
                }
            }
        }
    }
}



// Initialize the game
function initializeGame() {
    recordedPositions[0].push({ x: 0, y: 0, content: 'Empty' });
    avoidPlayerArea();

    placeElements(5, 'wumpus');

    placeElements(11, 'pit');

    placeElementHints(pits, 'breeze');
    placeElementHints(wumpuses, 'stench');
}

function calculateDistance(x1, y1, x2, y2) {
    // Calculate the Euclidean distance between two points (x1, y1) and (x2, y2)
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function selectBestPath(playerX, playerY) {
    getPossibleMoves(playerX, playerY);

    for (const move of possibleMoves) {
        checkForWumpus(move.x, move.y);
    }

    possibleMoves.sort((a, b) => {
        // Sort first by danger (ascending order)
        const dangerComparison = a.danger / a.neighbourCells - b.danger / b.neighbourCells;
        if (dangerComparison !== 0) {
            return dangerComparison;
        }

        // If danger is equal, sort by distance (ascending order)
        const distanceA = calculateDistance(playerX, playerY, a.x, a.y);
        const distanceB = calculateDistance(playerX, playerY, b.x, b.y);
        return distanceA - distanceB;
    });

    // if (possibleMoves[0].wumpus === 'possible_wumpus_exist') {
    //     for (const move in possibleMoves) {
    //         // console.log(possibleMoves[move].wumpus)
    //         if (possibleMoves[move].wumpus !== 'possible_wumpus_exist' && possibleMoves[move].danger !== 0) {
    //             // console.log('This is a move: ', move);
    //             return possibleMoves[move];
    //         }
    //     }
    // }

    console.log('possible moves: ', possibleMoves)

    return possibleMoves[0];
}

initializeGame();

updatePlayerPosition();

movePlayer('right');
