import * as Globals from "./global.js";
import { hasElement } from "./gameLogics.js";

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
                    cell.style.fontFamily = "Arial, sans-serif"; // Example font family
                    cell.style.fontSize = "13px"; 
                    cell.style.fontStyle = "italic";
                    if(hintName=='breeze'){
                        
                    }
                    cell.textContent = hintName;
                    cell.classList.add(hintName);
                }
            }
        }
    }
}

function placeElements(elementPosition, elementName,i) {
        elementPosition = { id: `${i}`, x:elementPosition.x, y:elementPosition.y };

        const element = document.createElement('div');
        if(elementName=='wumpus'){
            const image=document.createElement('img')
            image.src="UIController/images/wumpus.gif"
            element.appendChild(image)
        }
        else if(elementName=='pit'){
            const image=document.createElement('img')
            image.src="UIController/images/hole.png"
            image.style.width="150%"
            element.appendChild(image)
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


function generateManualBoard(totalWumpus, totalPits) {
    let pitNo=0, wumpusNo=0
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        const thumbCeil=document.createElement('div');
        thumbCeil.className = 'thumbnail-cell';

        const thumbElement=document.createElement('img')
        if(Globals.manualBoard[i]=='P'){
            thumbElement.src="UIController/images/hole.png"
            thumbElement.style.width="60%"
            thumbElement.style.margin="auto"
        }
        else if(Globals.manualBoard[i]=='W'){
            thumbElement.src="UIController/images/wumpus.gif"
            thumbElement.id=i
            thumbElement.style.margin="auto"
        }
        else if(Globals.manualBoard[i]=='G'){
            thumbElement.src="UIController/images/gold.png"
            console.log("manual gold")
            thumbElement.style.width="60%"
            thumbElement.id=i
            thumbElement.style.margin="auto"
        }
        thumbCeil.appendChild(thumbElement)

        const cell_elements = document.createElement('div');
        cell_elements.className = 'grid-cell-elements';
        cell_elements.setAttribute('data-x', i % 10);
        cell_elements.setAttribute('data-y', Math.floor(i / 10));
        thumbCeil.setAttribute('data-x', i % 10);
        thumbCeil.setAttribute('data-y', Math.floor(i / 10));

        const fruitNo=Math.floor(Math.random()*(12))+1
        const fruit=document.createElement('img')
        fruit.src=`UIController/images/fruit${fruitNo}.png`

        cell.style.marginTop="1px"
        cell.style.marginLeft="1px"
        cell.appendChild(cell_elements);
        cell.appendChild(fruit)
        Globals.gridContainer.appendChild(cell);
        Globals.thumbnailContainer.appendChild(thumbCeil)

        if(Globals.manualBoard[i]=='P'){
            placeElements({x:i%10, y:Math.floor(i / 10)}, 'pit', pitNo);
            pitNo++;
        }
        else if(Globals.manualBoard[i]=='W'){
            placeElements({x:i%10, y:Math.floor(i / 10)}, 'wumpus', wumpusNo);
            wumpusNo++;
        }
        else if(Globals.manualBoard[i]=='G'){
            placeElements({x:i%10, y:Math.floor(i / 10)}, 'wumpus', wumpusNo);
        }
    }

    Globals.recordedPositions[0].push({ x: 0, y: 0, content: 'Empty' });

    // avoidPlayerArea(Globals.playerPosition);

    placeElementHints(Globals.pits, 'breeze');
    placeElementHints(Globals.wumpuses, 'stench');
}

export { generateManualBoard };
