import { generateBoard } from '/boardGeneration.js';
import { updatePlayerPosition, movePlayer } from './gameEngine.js';
import * as Globals from './global.js';
// import { Overworld } from './UIController/Overworld.js';

const movements = Globals.neighbourCells;


function startGame () {
    // const overworld = new Overworld({
    //     element: document.querySelector(".game-container")
    // });
    // overworld.init();

    generateBoard(0, 10, 5, 10, 5);
    updatePlayerPosition();
    movePlayer('right');
}

(function () {

    startGame()
  
})();