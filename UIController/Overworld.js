
import { Person } from "./Person.js";
import { utils } from "./utils.js";
export class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;

    this.agent= new Person({
      isPlayerControlled: true,
      x: utils.withGrid(0),
      y: utils.withGrid(0),
      src:"/UIController/images/agent.png"
    });

    this.direction=null
    this.callback=null
  }
  async animateAgent(direction){
    return new Promise((resolve, reject)=>{
      this.direction=direction
      this.callback=()=>{
        this.direction=null
        this.callback=null
        resolve()
      }
    })
  }
  startGameLoop() {
    let direction="right"
    const step = () => {
      //Clear off the canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.agent.update({
        arrow:this.direction,
        callback: this.callback
      })
      this.agent.sprite.draw(this.ctx);

      
      requestAnimationFrame(() => {
        step();   
      })
    }
    step();
 }

 init() {

  this.startGameLoop();
 }

} 