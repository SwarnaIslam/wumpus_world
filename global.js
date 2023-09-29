const gridContainer = document.getElementById('grid-container');
const messageDisplay = document.getElementById('message');

const boardHeight = 10;
const boardWidth = 10;
let playerPosition = { x: 0, y: 0 };
let score = 0;
let arrows = 10;
let pits = [];
let wumpuses = [];
let recordedPositions = Array.from({ length: 10 }, () => []);
let possibleMoves = [];
let avoidPositions = [];
let offset=52/2-20/2
const neighbourCells = [
    { dx: -1, dy: 0, move: 'left' },
    { dx: 1, dy: 0, move: 'right' },
    { dx: 0, dy: -1, move: 'up' },
    { dx: 0, dy: 1, move: 'down' },
];

function findElement(positionX, positionY) {
    return document.querySelector(`#grid-container > .grid-cell > .grid-cell-elements[data-x="${positionX}"][data-y="${positionY}"]`);
}

function isCellInsideBoard(cellX, cellY) {
    if (cellX >= 0 && cellX < boardWidth && cellY >= 0 && cellY < boardHeight) {
        return true;
    }

    return false;
}

function setPossibleMoves(newPossibleMoves) {
    possibleMoves = newPossibleMoves;
}

function setWumpusLocations(newWumpusLocations) {
    wumpuses = newWumpusLocations;
}

export {
    gridContainer,
    messageDisplay,
    playerPosition,
    score,
    arrows,
    pits,
    wumpuses,
    recordedPositions,
    possibleMoves,
    avoidPositions,
    neighbourCells,
    findElement,
    isCellInsideBoard,
    setPossibleMoves,
    setWumpusLocations,
    offset
};