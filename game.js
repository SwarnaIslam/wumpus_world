import { generateBoard } from '/boardGeneration.js';
import { updatePlayerPosition, movePlayer } from './gameEngine.js';
import * as Globals from './global.js';

const movements = Globals.neighbourCells;


function startGame () {
    generateBoard(5, 10);
    updatePlayerPosition();
    movePlayer('right');
}

startGame();
