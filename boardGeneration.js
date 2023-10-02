import * as Globals from "./global.js";
import { hasElement } from "./gameLogics.js";

const boardState=[]
function placeRandomElementAvoidingAdjacent(element, position) {
    let randomX, randomY;
    do {
        randomX = Math.floor(Math.random() * 10);
        randomY = Math.floor(Math.random() * 10);
    } while (Globals.avoidPositions.some(avoidPos => Math.abs(randomX - avoidPos.x) <= 0 && Math.abs(randomY - avoidPos.y) <= 0));

    position.x = randomX;
    position.y = randomY;
    // element.style.left = randomX * Globals.cellWidth + Globals.offset + 'px';
    // element.style.top = randomY * Globals.cellWidth + Globals.offset + 'px';
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
                const hasGold = cell.querySelector('.gold');

                if (hasWumpus || hasPit || hasGold) {
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
                    cell.style.fontFamily = "Arial, sans-serif"; // Example font family
                    cell.style.fontSize = "13px"; 
                    cell.style.fontStyle = "italic";
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
        if(elementName=='wumpus'){
            const image=document.createElement('img')
            image.src="UIController/images/wumpus.gif"
            element.appendChild(image)
            boardState[`${elementPosition.y}${elementPosition.x}`]='W'
        }
        else if(elementName=='pit'){
            const image=document.createElement('img')
            image.src="UIController/images/hole.png"
            image.width="10%"
            element.appendChild(image)
            boardState[`${elementPosition.y}${elementPosition.x}`]='P'
        }

        

        element.className = elementName;
        element.id = i;
        element.style.left = elementPosition.x * Globals.cellWidth + Globals.offset + 'px';
        element.style.top = elementPosition.y * Globals.cellWidth + Globals.offset + 'px';
        const cell_elements = Globals.findElement(elementPosition.x, elementPosition.y);
        cell_elements.appendChild(element);
        if (elementName == 'pit') Globals.pits.push(elementPosition);
        else if (elementName == 'wumpus') Globals.wumpuses.push(elementPosition);
    }
}

function avoidElementArea(elementPosition, elementName) {
    Globals.avoidPositions.push({ x: elementPosition.x, y: elementPosition.y });

    if (elementName === 'gold') {
        Globals.avoidPositions.push({ x: elementPosition.x + 1, y: elementPosition.y });
        Globals.avoidPositions.push({ x: elementPosition.x, y: elementPosition.y + 1 });
        Globals.avoidPositions.push({ x: elementPosition.x - 1, y: elementPosition.y });
        Globals.avoidPositions.push({ x: elementPosition.x, y: elementPosition.y - 1 });
    }
}

function generateBoard(totalWumpus, totalPits) {

    Globals.setInitialArrowsScoreAndGolds(totoalArrows, initialScore, totalGolds);

    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        
        const cell_elements = document.createElement('div');
        cell_elements.className = 'grid-cell-elements';
        cell_elements.setAttribute('data-x', i % 10);
        cell_elements.setAttribute('data-y', Math.floor(i / 10));

        const fruitNo=Math.floor(Math.random()*(12))+1
        const fruit=document.createElement('img')
        fruit.src=`UIController/images/fruit${fruitNo}.png`

        cell.style.marginTop="1px"
        cell.style.marginLeft="1px"
        cell.appendChild(cell_elements);
        cell.appendChild(fruit)
        Globals.gridContainer.appendChild(cell);

        boardState.push('-')
    }

    Globals.recordedPositions[0].push({ x: 0, y: 0, content: 'Empty' });

    avoidPlayerArea(Globals.playerPosition);
    placeElements(totalPits, 'pit');
    placeElements(totalWumpus, 'wumpus');

    for(let i=0;i<100;i++){
        const thumbCeil=document.createElement('div');
        thumbCeil.className = 'thumbnail-cell';
        const thumbElement=document.createElement('img')
        if(boardState[i]=='P'){
            thumbElement.src="UIController/images/hole.png"
            thumbElement.style.width="60%"
            thumbElement.style.margin="auto"
        }
        else if(boardState[i]=='W'){
            thumbElement.src="UIController/images/wumpus.gif"
            thumbElement.id=i
            thumbElement.style.margin="auto"
        }
        else if(boardState[i]=='G'){
            thumbElement.src="UIController/images/gold.png"
            thumbElement.id=i
            thumbElement.style.margin="auto"
        }
        thumbCeil.appendChild(thumbElement)
        thumbCeil.setAttribute('data-x', i % 10);
        thumbCeil.setAttribute('data-y', Math.floor(i / 10));
        Globals.thumbnailContainer.appendChild(thumbCeil)
    }

    placeElementHints(Globals.pits, 'breeze');
    placeElementHints(Globals.wumpuses, 'stench');
}

export { generateBoard };
