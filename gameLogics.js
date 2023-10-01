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

function findIndexFromRecordedPositions(positionX, positionY) {
    return Globals.recordedPositions[positionY].findIndex(cell => cell.x === positionX && cell.y === positionY);
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

function markWumpusInNeighbourCellsOfStench(positionX, positionY) {
    let visitedCells = 0;
    let stenchCells = 0;

    for (const { dx, dy } of Globals.neighbourCells) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (Globals.isCellInsideBoard(newX, newY) && isCellVisited(newX, newY)) {
            visitedCells = visitedCells + 1;
            const cell = Globals.findElement(newX, newY);
            if (hasElement(cell, 'stench')) {
                stenchCells = stenchCells + 1;
            }
        }
    }

    if (visitedCells === stenchCells) {
        return true;
    }

    return false;
}

function checkANdUpdateWumpusInCellUsingStench(positionX, positionY) {
    let unvisitedCells = 0;
    let noWumpusInCell = 0;
    let wumpusPosition = {};

    for (const { dx, dy } of Globals.neighbourCells) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (Globals.isCellInsideBoard(newX, newY) && !isCellVisited(newX, newY)) {
            unvisitedCells = unvisitedCells + 1;
            if (!markWumpusInNeighbourCellsOfStench(newX, newY)) {
                noWumpusInCell = noWumpusInCell + 1;
            }
            if (markWumpusInNeighbourCellsOfStench(newX, newY)) {
                wumpusPosition = { x: newX, y: newY };
            }
        }
    }

    if (noWumpusInCell === unvisitedCells - 1) {
        const cellIndex = findIndexFromPossibleMoves(wumpusPosition.x, wumpusPosition.y);
        Globals.possibleMoves[cellIndex].wumpusExists = true;
    }
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

function checkAndUpdateWumpusAndPitLocationsOnBoard() {
    for (const move of Globals.possibleMoves) {
        checkAndUpdateWumpusInCell(move.x, move.y);
        checkAndUpdatePitInCell(move.x, move.y);
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

    console.log('hello');
}

function checkAndUpdateWumpusInCell(positionX, positionY) {
    let neighbourCells = 0;
    let stenchCells = 0;

    for (const { dx, dy } of Globals.neighbourCells) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (Globals.isCellInsideBoard(newX, newY) && Globals.arrows > 0) {
            neighbourCells = neighbourCells + 1;
            const cell = Globals.findElement(newX, newY);

            if (isCellVisited(newX, newY) && cell && cell.textContent) {
                if (hasElement(cell, 'stench')) {
                    checkANdUpdateWumpusInCellUsingStench(newX, newY);
                    stenchCells = stenchCells + 1;
                }
            }
        }
    }

    if (stenchCells / neighbourCells >= 0.5) {
        const cellIndex = findIndexFromPossibleMoves(positionX, positionY);
        setCellHasWumpus(cellIndex);
    }
}

function areAllCellsVisitedAroundBreeze(positionX, positionY) {
    let neighbourCells = 0;
    let visitedCells = 0;

    for (const { dx, dy } of Globals.neighbourCells) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (Globals.isCellInsideBoard(newX, newY) && Globals.arrows > 0) {
            neighbourCells = neighbourCells + 1;
            const cell = Globals.findElement(newX, newY);

            if (isCellVisited(newX, newY)) {
                visitedCells = visitedCells + 1;
            }
        }
    }

    if (visitedCells === neighbourCells - 1) {
        return true;
    }

    return false;
}

function checkAndUpdatePitInCell(positionX, positionY) {

    for (const { dx, dy } of Globals.neighbourCells) {
        const newX = positionX + dx;
        const newY = positionY + dy;

        if (Globals.isCellInsideBoard(newX, newY) && Globals.arrows > 0) {
            const cell = Globals.findElement(newX, newY);

            if (isCellVisited(newX, newY) && cell && cell.textContent) {
                if (hasElement(cell, 'breeze') && areAllCellsVisitedAroundBreeze(newX, newY)) {
                    const cellIndex = findIndexFromPossibleMoves(positionX, positionY);
                    setCellHasPit(cellIndex);
                }
            }
        }
    }
}

function isGoldInPlayerPosition(positionX, positionY) {
    const cell = Globals.findElement(positionX, positionY);

    const hasGold = cell.querySelector('.gold');

    if (hasGold) {
        const cellIndex = findIndexFromPossibleMoves(positionX, positionY);
        setCellHasGold(cellIndex);

        return true;
    }

    return false;
}

function getPossibleMoves() {
    const cell = Globals.findElement(playerPositionX, playerPositionY);
    let goldFound = false;

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

    if (isGoldInPlayerPosition(playerPositionX, playerPositionY)) {
        goldFound = true;
    }

    pushPositionInRecordedPositions(Globals.playerPosition.x, Globals.playerPosition.y);

    if (!goldFound) {
        removeVisitedCellsFromPossibleMoves();
    }

    checkForSafeCells();

    // possibleMoves = possibleMoves.filter(cell => cell.danger !== 4);
}

function selectBestMove(playerX, playerY) {
    playerPositionX = playerX;
    playerPositionY = playerY;

    getPossibleMoves();

    checkAndUpdateWumpusAndPitLocationsOnBoard();

    sortMovesByDistanceAndDanger();


    let bestMove;
    let bestMoveFound = false;

    for (const move of Globals.possibleMoves) {
        if (move.goldExists) {
            bestMove = move;
            bestMoveFound = true;
            break;
        }
    }

    if (!bestMoveFound) {
        for (const move of Globals.possibleMoves) {
            if (!move.pitExists) {
                if (move.wumpusExists) {
                    bestMove = move;
                    bestMoveFound = true;
                    break;
                }
            }
        }
    }

    if (!bestMoveFound) {
        for (const move of Globals.possibleMoves) {
            if (!move.pitExists) {
                bestMove = move;
                break;
            }
        }
    }

    // console.log('All possible Moves: ', Globals.possibleMoves);

    return bestMove;
}

export { selectBestMove, isCellVisited, hasElement };