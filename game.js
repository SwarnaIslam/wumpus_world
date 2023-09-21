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
let recordedPositions = Array.from({ length: 10 }, () => []);
let possibleMoves = [];

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

function recordPosition(positionX, positionY) {
    const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${positionX}"][data-y="${positionY}"]`);
    const cellExists = recordedPositions[positionY].some(cell => cell.x === positionX && cell.y === positionY);

    if (!cellExists) {
        if (cell.textContent.includes('Stench')) {
            recordedPositions[positionY].push({ x: positionX, y: positionY, content: 'Stench' });
        }
        else if (cell.textContent.includes('Breeze')) {
            recordedPositions[positionY].push({ x: positionX, y: positionY, content: 'Breeze' });
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

function checkEmptyNeighbourCell() {
    // console.log('all Possible moves: ', possibleMoves);
    for (const move of possibleMoves) {
        // console.log("going with move: ", move);
        checkEmptyCell(move.x, move.y);
    }
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
                if (cell.textContent.includes('Stench')) {
                    if (cellIndex !== -1) {
                        possibleMoves[cellIndex].danger = possibleMoves[cellIndex].danger + 1;
                    }
                    else {
                        possibleMoves.push({ x: newX, y: newY, danger: 1 });
                    }
                }
                else if (cell.textContent.includes('Breeze')) {
                    if (cellIndex !== -1) {

                        possibleMoves[cellIndex].danger = possibleMoves[cellIndex].danger + 1;
                    }
                    else {
                        possibleMoves.push({ x: newX, y: newY, danger: 1 });
                    }
                }
                else if (cellIndex === -1) {
                    possibleMoves.push({ x: newX, y: newY, danger: 0 });
                }
            }
        }
    }

    recordPosition(playerPosition.x, playerPosition.y);

    // console.log('Recorded move: ', recordedPositions);

    possibleMoves = possibleMoves.filter(cell => !recordedPositions.some(subarray => subarray.some(recordedCell => recordedCell.x === cell.x && recordedCell.y === cell.y)));

    checkEmptyNeighbourCell();
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

    // No path found
    return [];
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

    if (checkCollision(playerPosition, wumpusPosition)) {
        messageDisplay.textContent = 'You encountered the Wumpus! Game Over';
        alert(messageDisplay.textContent)
        return;
    } else if (checkPitCollisions()) {
        messageDisplay.textContent = 'You fell into a pit! Game Over';
        alert(messageDisplay.textContent);
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
            // console.log(move);
            setTimeout(() => {
                // console.log('moving');
                movePlayer(move);
            }, 0.5);
            break;
        }
    }
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

    const currentCell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${playerPosition.x}"][data-y="${playerPosition.y}"]`);

    currentCell.style.display = 'block';

    player.style.transform = 'translate(+75%, +75%)'; // Center the player in the cell
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
    recordedPositions[0].push({ x: 0, y: 0, content: 'Empty' });

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
    avoidPositions.push({ x: wumpusPosition.x + 1, y: wumpusPosition.y });
    avoidPositions.push({ x: wumpusPosition.x - 1, y: wumpusPosition.y });
    avoidPositions.push({ x: wumpusPosition.x, y: wumpusPosition.y + 1 });
    avoidPositions.push({ x: wumpusPosition.x, y: wumpusPosition.y - 1 });

    wumpus.style.transform = 'translate(+75%, +75%)';
    const cell_elements = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${wumpusPosition.x}"][data-y="${wumpusPosition.y}"]`);
    cell_elements.appendChild(wumpus);

    const numberOfPits = 10;
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
        const cell_elements = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${pitPosition.x}"][data-y="${pitPosition.y}"]`);
        cell_elements.appendChild(pit);

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
            const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${cellX}"][data-y="${cellY}"]`);
            cell.textContent = "Stench";
            cell.classList.add("stench");
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
                !document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${cellX}"][data-y="${cellY}"]`).textContent.includes("Stench") &&
                !document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${cellX}"][data-y="${cellY}"]`).textContent.includes("Breeze") &&
                !pits.some(pit => pit.x === cellX && pit.y === cellY) &&
                !(cellX === wumpusPosition.x && cellY === wumpusPosition.y)
            ) {
                const cell = document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${cellX}"][data-y="${cellY}"]`);
                cell.textContent = "Breeze";
                cell.classList.add("breeze");
            }
        }
    }
}

function calculateDistance(x1, y1, x2, y2) {
    // Calculate the Euclidean distance between two points (x1, y1) and (x2, y2)
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function selectBestPath(playerX, playerY) {
    getPossibleMoves(playerX, playerY);

    possibleMoves.sort((a, b) => {
        // Sort first by danger (ascending order)
        const dangerComparison = a.danger - b.danger;
        if (dangerComparison !== 0) {
            return dangerComparison;
        }

        // If danger is equal, sort by distance (ascending order)
        const distanceA = calculateDistance(playerX, playerY, a.x, a.y);
        const distanceB = calculateDistance(playerX, playerY, b.x, b.y);
        return distanceA - distanceB;
    });

    // console.log('All possible moves: ', possibleMoves);

    return possibleMoves[0];
}

initializeGame();

updatePlayerPosition();

movePlayer('right');
