import * as Globals from "./global.js";

let playerPositionX = 0;
let playerPositionY = 0;

function increaseDanger(index, dangerLevel) {
    Globals.possibleMoves[index].danger = Globals.possibleMoves[index].danger + dangerLevel;
}

function decreaseDanger(index, dangerLevel) {
    Globals.possibleMoves[index].danger = Globals.possibleMoves[index].danger - dangerLevel;
}

function setDanger(index, dangerLevel) {
    Globals.possibleMoves[index].danger = dangerLevel;
}

function setCellHasWumpus(index) {
    Globals.possibleMoves[index].wumpusExists = true;
}

function setCellHasPit(index) {
    Globals.possibleMoves[index].pitExists = true;
}

function setCellHasGold(index) {
    Globals.possibleMoves[index].goldExists = true;
}

function findIndexFromPossibleMoves(positionX, positionY) {
    return Globals.possibleMoves.findIndex(cell => cell.x === positionX && cell.y === positionY);
}

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function pushNewPossibleMove(positionX, positionY, dangerLevel) {
    Globals.possibleMoves.push({
        x: positionX,
        y: positionY,
        danger: dangerLevel,
        neighbourCells: neighbourCellCount(positionX, positionY),
        wumpusExists: false,
        pitExists: false,
        goldExists: false,
    });
}

function pushNewVisitedCell(positionX, positionY, exisitingElement) {
    Globals.recordedPositions[positionY].push({ x: positionX, y: positionY, exisitingElement: exisitingElement });
}

function isCellVisited(cellX, cellY) {
    return Globals.recordedPositions[cellY].some(cell => cell.x === cellX && cell.y === cellY);
}

function hasElement(cell, elementName) {
    return cell.textContent.includes(elementName);
}

function removeVisitedCellsFromPossibleMoves() {
    Globals.setPossibleMoves(Globals.possibleMoves.filter(cell => !Globals.recordedPositions.some(subarray => subarray.some(recordedCell => recordedCell.x === cell.x && recordedCell.y === cell.y))));
}

function checkAndUpdateWumpusLocationsOnBoard() {
    for (const move of Globals.possibleMoves) {
        checkAndUpdateWumpusInCell(move.x, move.y);
    }
}

function checkEmptyCell(positionX, positionY) {
    for (const { dx, dy } of Globals.neighbourCells) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
            const cell = Globals.findElement(newX, newY);

            if (isCellVisited(newX, newY) && cell && !cell.textContent) {
                const cellIndex = findIndexFromPossibleMoves(positionX, positionY);
                setDanger(cellIndex, 0);
            }
        }
    }
}

function checkForSafeCells() {
    for (const move of Globals.possibleMoves) {
        // checkForPitsAndWumpusUsingBreezeAndStench(move.x, move.y);
        checkEmptyCell(move.x, move.y);
        // checkStenchAndBreezeCombinationAroundCells(move.x, move.y);
    }
}

function sortMovesByDistanceAndDanger() {
    Globals.possibleMoves.sort((a, b) => {
        const dangerComparison = a.danger / a.neighbourCells - b.danger / b.neighbourCells;
        if (dangerComparison !== 0) {
            return dangerComparison;
        }

        const distanceA = calculateDistance(playerPositionX, playerPositionY, a.x, a.y);
        const distanceB = calculateDistance(playerPositionX, playerPositionY, b.x, b.y);
        return distanceA - distanceB;
    });
}

function neighbourCellCount(positionX, positionY) {

    let totalNeighbourCellsCount = 0;

    for (const { dx, dy } of Globals.neighbourCells) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10) {
            totalNeighbourCellsCount = totalNeighbourCellsCount + 1;
        }
    }

    return totalNeighbourCellsCount;
}

function pushPositionInRecordedPositions(positionX, positionY) {
    const cell = Globals.findElement(positionX, positionY);

    if (!isCellVisited(positionX, positionY)) {
        if (hasElement(cell, 'stench')) {
            pushNewVisitedCell(positionX, positionY, 'stench');
        }
        else if (hasElement(cell, 'breeze')) {
            pushNewVisitedCell(positionX, positionY, 'breeze');
        }
        else {
            pushNewVisitedCell(positionX, positionY, 'Empty')
        }
    }
}

function checkAndUpdateWumpusInCell(positionX, positionY) {
    let neighbourCells = 0;
    let stenchCells = 0;

    for (const { dx, dy } of Globals.neighbourCells) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (newX >= 0 && newX < 10 && newY >= 0 && newY < 10 && Globals.arrows > 0) {
            neighbourCells = neighbourCells + 1;
            const cell = Globals.findElement(newX, newY);

            if (isCellVisited(newX, newY) && cell && cell.textContent) {
                if (hasElement(cell, 'stench')) {
                    stenchCells = stenchCells + 1;
                }
            }
        }
    }

    if (stenchCells / neighbourCells >= 0.5) {
        const cellIndex = findIndexFromPossibleMoves(positionX, positionY);
        setDanger(cellIndex, 0);
        setCellHasWumpus(cellIndex);
    }
}

function getPossibleMoves() {
    const cell = Globals.findElement(playerPositionX, playerPositionY);

    for (const { dx, dy } of Globals.neighbourCells) {
        const newX = playerPositionX + dx;
        const newY = playerPositionY + dy;

        if (Globals.isCellInsideBoard(newX, newY)) {
            const cellIndex = Globals.possibleMoves.findIndex(cell => cell.x === newX && cell.y === newY);

            if (!isCellVisited(playerPositionX, playerPositionY)) {
                if (hasElement(cell, 'stench')) {
                    if (cellIndex !== -1) {
                        increaseDanger(cellIndex, 2);
                    }
                    else {
                        pushNewPossibleMove(newX, newY, 2);
                    }
                }
                else if (hasElement(cell, 'breeze')) {
                    if (cellIndex !== -1) {
                        increaseDanger(cellIndex, 1);
                    }
                    else {
                        pushNewPossibleMove(newX, newY, 1);
                    }
                }
                else if (hasElement(cell, 'stench') && hasElement(cell, 'breeze')) {
                    if (cellIndex !== -1) {
                        increaseDanger(cellIndex, 3);
                    }
                    else {
                        pushNewPossibleMove(newX, newY, 3);
                    }
                }
                else if (cellIndex === -1) {
                    pushNewPossibleMove(newX, newY, 0);
                }
            }
        }
    }

    pushPositionInRecordedPositions(Globals.playerPosition.x, Globals.playerPosition.y);

    removeVisitedCellsFromPossibleMoves();

    checkForSafeCells();

    // possibleMoves = possibleMoves.filter(cell => cell.danger !== 4);
}

function selectBestMove(playerX, playerY) {
    playerPositionX = playerX;
    playerPositionY = playerY;

    getPossibleMoves();

    checkAndUpdateWumpusLocationsOnBoard();

    sortMovesByDistanceAndDanger();


    const bestMove = Globals.possibleMoves[0];

    return bestMove;
}

export { selectBestMove, isCellVisited , hasElement};