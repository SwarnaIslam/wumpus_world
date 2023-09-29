import { generateBoard } from '/boardGeneration.js';
import { updatePlayerPosition, movePlayer } from './gameEngine.js';
import * as Globals from './global.js';

const movements = Globals.neighbourCells;


function startGame () {
    generateBoard(7, 13);
    updatePlayerPosition();
    movePlayer('right');
}

startGame();
