import * as Globals from "./global.js";
import { hasElement } from "./gameLogics.js";


function placeRandomElementAvoidingAdjacent(element, position) {
    let randomX, randomY;
    do {
        randomX = Math.floor(Math.random() * 10);
        randomY = Math.floor(Math.random() * 10);
    } while (Globals.avoidPositions.some(avoidPos => Math.abs(randomX - avoidPos.x) <= 0 && Math.abs(randomY - avoidPos.y) <= 0));

    position.x = randomX;
    position.y = randomY;
    element.style.left = randomX * 54 + Globals.offset + 'px';
    element.style.top = randomY * 54 + Globals.offset + 'px';
}

function avoidPlayerArea(playerPosition) {
    Globals.avoidPositions.push({ x: playerPosition.x, y: playerPosition.y });
    Globals.avoidPositions.push({ x: playerPosition.x + 1, y: playerPosition.y });
    Globals.avoidPositions.push({ x: playerPosition.x, y: playerPosition.y + 1 });
    Globals.avoidPositions.push({ x: playerPosition.x + 1, y: playerPosition.y + 1 });
    Globals.avoidPositions.push({ x: playerPosition.x + 2, y: playerPosition.y });
    Globals.avoidPositions.push({ x: playerPosition.x, y: playerPosition.y + 2 });
    Globals.avoidPositions.push({ x: playerPosition.x + 2, y: playerPosition.y + 2 });
}

function placeElementHints(elements, hintName) {
    for (const elementPosition of elements) {

        for (const { dx, dy } of Globals.neighbourCells) {
            const cellX = elementPosition.x + dx;
            const cellY = elementPosition.y + dy;

            if (
                cellX >= 0 && cellX < 10 &&
                cellY >= 0 && cellY < 10
            ) {
                const cell = Globals.findElement(cellX, cellY);

                const hasWumpus = cell.querySelector('.wumpus');
                const hasPit = cell.querySelector('.pit');

                if (hasWumpus || hasPit) {
                    continue;
                }


                if (cell.textContent) {
                    if (hasElement(cell, 'stench') && hasElement(cell, 'breeze')) {
                        continue;
                    }
                    else if (hasElement(cell, 'breeze') && hintName === 'stench') {
                        cell.textContent = cell.textContent.concat(` ${hintName}`);
                    } else if (hasElement(cell, 'stench') && hintName === 'breeze') {
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

function placeElements(numberOfElements, elementName) {
    for (let i = 0; i < numberOfElements; i++) {
        const elementPosition = { id: `${i}` };
        placeRandomElementAvoidingAdjacent(document.createElement('div'), elementPosition);
        avoidElementArea(elementPosition, elementName);
        const element = document.createElement('div');
        element.className = elementName;
        element.id = i;
        element.style.left = elementPosition.x * 54 + Globals.offset + 'px';
        element.style.top = elementPosition.y * 54 + Globals.offset + 'px';
        const cell_elements = Globals.findElement(elementPosition.x, elementPosition.y);
        cell_elements.appendChild(element);

        if (elementName == 'pit') Globals.pits.push(elementPosition);
        else if (elementName == 'wumpus') Globals.wumpuses.push(elementPosition);
    }
}

function avoidElementArea(elementPosition, elementName) {
    Globals.avoidPositions.push({ x: elementPosition.x, y: elementPosition.y });

    if (elementName === 'pit') {
        Globals.avoidPositions.push({ x: elementPosition.x + 1, y: elementPosition.y });
        Globals.avoidPositions.push({ x: elementPosition.x, y: elementPosition.y + 1 });
        Globals.avoidPositions.push({ x: elementPosition.x - 1, y: elementPosition.y });
        Globals.avoidPositions.push({ x: elementPosition.x, y: elementPosition.y - 1 });
    }
}

function generateBoard(totalWumpus, totalPits) {

    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        const cell_elements = document.createElement('div');
        cell_elements.className = 'grid-cell-elements';
        cell_elements.setAttribute('data-x', i % 10);
        cell_elements.setAttribute('data-y', Math.floor(i / 10));
        cell.appendChild(cell_elements);
        Globals.gridContainer.appendChild(cell);
    }

    Globals.recordedPositions[0].push({ x: 0, y: 0, content: 'Empty' });
    avoidPlayerArea(Globals.playerPosition);

    placeElements(totalPits, 'pit');
    placeElements(totalWumpus, 'wumpus');

    placeElementHints(Globals.pits, 'breeze');
    placeElementHints(Globals.wumpuses, 'stench');
}

export { generateBoard };
