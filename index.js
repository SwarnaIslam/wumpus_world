import { updatePlayerPosition, movePlayer } from './gameEngine.js';
import * as Globals from './global.js';
import { generateBoard } from './boardGeneration.js';
import { generateManualBoard } from './manualBoard.js';

const movements = Globals.neighbourCells;


function startGame () {
    
    generateBoard(7, 11);
    updatePlayerPosition();
    movePlayer('right');
}

(function () {

    startGame()
  
})();
const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', function() {
    console.log("file entered")
    const file = this.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const fileContent = e.target.result;
        processFileContent(fileContent);
    };

    reader.readAsText(file);
});

function processFileContent(content) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (let j = 0; j < line.length; j++) {
            const character = line.charAt(j);
            Globals.manualBoard.push(character)
        }
    }
    generateManualBoard()
    movePlayer("right")
}