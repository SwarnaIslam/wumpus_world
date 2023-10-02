import { GameObject } from "./GameObject.js";
export class Person extends GameObject {
  constructor(config) {
    super(config);
    this.movingProgressRemaining = 0;

    this.isPlayerControlled = config.isPlayerControlled || false;
    this.speed=3
    this.directionUpdate = {
      "up": ["y", -this.speed],
      "down": ["y", this.speed],
      "left": ["x", -this.speed],
      "right": ["x", this.speed],
    }
  }

  update(state) {
    
    this.updatePosition(state);
    this.updateSprite(state);

    if (this.isPlayerControlled && this.movingProgressRemaining === 0 && state.arrow) {
      this.direction = state.arrow;
      this.movingProgressRemaining = 54/this.speed ;
    }
    
  }

  updatePosition(state) {
    // console.log(this.movingProgressRemaining)
    if (this.movingProgressRemaining > 0) {
      const [property, change] = this.directionUpdate[this.direction];
      this[property] += change;
      this.movingProgressRemaining -= 1;
      if(this.movingProgressRemaining-1===0 && state.callback){
        state.callback()
      }
    }
  }

  updateSprite(state) {

    if (this.isPlayerControlled && this.movingProgressRemaining === 0 && !state.arrow) {
      this.sprite.setAnimation("idle-"+this.direction);
      return;
    }

    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-"+this.direction);
    }
  }

}