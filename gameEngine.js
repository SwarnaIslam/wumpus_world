import * as Globals from "./global.js"
import { hasElement, isCellVisited, selectBestMove } from "./gameLogics.js";
import { findPath } from "./pathFinder.js";
let isGameOver = false
function checkCollision(position1, position2) {
    return position1.x === position2.x && position1.y === position2.y;
}

async function movePlayerWithDelay(move, shoot, nextBestMove, delayTime) {
    setTimeout(async () => {
        if (shoot) {
            shootArrow(nextBestMove);
        }
        await movePlayer(move);
    }, delayTime);
}

function isWumpusInNextCell(nextBestMove, nextCellToMove) {
    if (nextBestMove.wumpusExists && nextCellToMove.x === nextBestMove.x && nextCellToMove.y === nextBestMove.y) {
        return true;
    }

    return false;
}

function checkWumpusCollisions() {
    for (const wumpusPosition of Globals.wumpuses) {
        if (checkCollision(Globals.playerPosition, wumpusPosition)) {
            return true;
        }
    }
    return false;
}

function checkPitCollisions() {
    for (const pitPosition of Globals.pits) {
        if (checkCollision(Globals.playerPosition, pitPosition)) {
            return true;
        }
    }
    return false;
}

function updateDangerForStenchNeighbourCells(positionX, positionY, dangerReduction) {
    for (const { dx, dy } of Globals.neighbourCells) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        const existsInPossibleMoves = Globals.possibleMoves.some(cell => cell.x === newX && cell.y === newY);

        if (existsInPossibleMoves) {
            const cellIndex = Globals.possibleMoves.findIndex(cell => cell.x === newX && cell.y === newY);
            Globals.possibleMoves[cellIndex].danger = Globals.possibleMoves[cellIndex].danger - dangerReduction;
        }
    }
}

function checkForNeighbourWumpus(positionX, positionY) {
    for (const { dx, dy } of Globals.neighbourCells) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (Globals.isCellInsideBoard(newX, newY)) {
            const cell = Globals.findElement(newX, newY);

            const hasWumpus = cell.querySelector('.wumpus');

            if (hasWumpus) {
                if (Globals.possibleMoves.some(cell => cell.x === newX && cell.y === newY)) {
                    const cellIndex = Globals.possibleMoves.findIndex(cell => cell.x === newX && cell.y === newY); //needs updating
                    Globals.possibleMoves[cellIndex].danger = Globals.possibleMoves[cellIndex].danger + 2; //needs updating
                }
                return true;
            }
        }
    }

    return false;
}

function removeStenches(positionX, positionY) {
    for (const { dx, dy } of Globals.neighbourCells) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        const cell = Globals.findElement(newX, newY);

        if (cell) {
            if (hasElement(cell, 'stench') && !checkForNeighbourWumpus(newX, newY)) {
                if (cell.textContent.includes('breeze')) {
                    cell.textContent = 'breeze';
                    updateDangerForStenchNeighbourCells(newX, newY, 1);
                }
                else {
                    cell.textContent = '';
                    updateDangerForStenchNeighbourCells(newX, newY, 2);
                }
            }
        }
    }
}

function checkAndUpdateStenchesForNeighbourWumpus(positionX, positionY) {
    if (checkForNeighbourWumpus(positionX, positionY)) {
        const cell = Globals.findElement(positionX, positionY);
        cell.textContent = 'stench';
    }
}

function shootArrow(wumpusPosition) {
    if (Globals.arrows > 0) {
        const cell = Globals.findElement(wumpusPosition.x, wumpusPosition.y);
        if (cell) {
            const wumpusElement = cell.querySelector('.wumpus');
            if (wumpusElement) {
                wumpusElement.remove();

                removeStenches(wumpusPosition.x, wumpusPosition.y);
                Globals.setWumpusLocations(Globals.wumpuses.filter(cell => cell.x !== wumpusPosition.x && cell.y !== wumpusPosition.y));

                checkAndUpdateStenchesForNeighbourWumpus(wumpusPosition.x, wumpusPosition.y);
            }
        }
        // updateArrows();
    }
}

async function updatePlayerPosition() {
    return new Promise((resolve, reject) => {
        player.style.left = Globals.playerPosition.x * 54 + Globals.offset + 'px';
        player.style.top = Globals.playerPosition.y * 54 + Globals.offset + 'px';

        const currentCell = Globals.findElement(Globals.playerPosition.x, Globals.playerPosition.y);

        currentCell.style.display = 'block';
        requestAnimationFrame(() => {
            resolve();
        });
    });

}

async function movePlayer(direction) {
    if (isGameOver) return
    switch (direction) {
        case 'left':
            if (Globals.playerPosition.x > 0) {
                Globals.playerPosition.x--;
            }
            break;
        case 'right':
            if (Globals.playerPosition.x < 9) {
                Globals.playerPosition.x++;
            }
            break;
        case 'up':
            if (Globals.playerPosition.y > 0) {
                Globals.playerPosition.y--;
            }
            break;
        case 'down':
            if (Globals.playerPosition.y < 9) {
                Globals.playerPosition.y++;
            }
            break;
    }


    await updatePlayerPosition();
    // updateScore();

    const nextBestMove = selectBestMove(Globals.playerPosition.x, Globals.playerPosition.y);

    const pathToTargetCell = findPath(Globals.playerPosition.x, Globals.playerPosition.y, nextBestMove.x, nextBestMove.y);

    const nextCellToMove = pathToTargetCell[1];

    for (const { dx, dy, move } of Globals.neighbourCells) {
        const newX = Globals.playerPosition.x + dx;
        const newY = Globals.playerPosition.y + dy;

        if (newX === nextCellToMove.x && newY === nextCellToMove.y) {
            if (isWumpusInNextCell(nextBestMove, nextCellToMove)) {

                await movePlayerWithDelay(move, true, nextBestMove, 1000);
                break;
            }
            else {
                await movePlayerWithDelay(move, false, nextBestMove, 1000);
                break;
            }
        }
    }

    if (checkWumpusCollisions()) {
        Globals.messageDisplay.textContent = 'You were encountered by wumpus! Game Over';
        isGameOver = true
        alert(Globals.messageDisplay.textContent);
    } else if (checkPitCollisions()) {
        Globals.messageDisplay.textContent = 'You fell into a pit! Game Over';
        isGameOver = true
        alert(Globals.messageDisplay.textContent);
    }
}

export { updatePlayerPosition, movePlayer };