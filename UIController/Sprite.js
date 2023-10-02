import { utils } from "./utils.js";

export class Sprite {
  constructor(config) {

    //Set up the image
    this.image = new Image();
    this.image.src = config.src;
    this.image.onload = () => {
      this.isLoaded = true;
    }

    //Configure Animation & Initial State
    this.animations = config.animations || {
      "idle-down" : [ [0,0] ],
      "idle-right": [ [0,3] ],
      "idle-up"   : [ [0,1] ],
      "idle-left" : [ [0,2] ],
      "walk-down" : [ [0,0],[1,0],[2,0],[3,0], ],
      "walk-right": [ [0,3],[1,3],[2,3],[3,3], ],
      "walk-up"   : [ [0,1],[1,1],[2,1],[3,1], ],
      "walk-left" : [ [0,2],[1,2],[2,2],[3,2], ]
    }
    this.currentAnimation = "idle-right"; // config.currentAnimation || "idle-down";
    this.currentAnimationFrame = 0;

    this.animationFrameLimit = config.animationFrameLimit || 8;
    this.animationFrameProgress = this.animationFrameLimit;
    

    //Reference the game object
    this.gameObject = config.gameObject;
  }

  get frame() {
    return this.animations[this.currentAnimation][this.currentAnimationFrame]
  }

  setAnimation(key) {
    if (this.currentAnimation !== key) {
      this.currentAnimation = key;
      this.currentAnimationFrame = 0;
      this.animationFrameProgress = this.animationFrameLimit;
    }
  }

  updateAnimationProgress() {
    //Downtick frame progress
    if (this.animationFrameProgress > 0) {
      this.animationFrameProgress -= 1;
      return;
    }

    //Reset the counter
    this.animationFrameProgress = this.animationFrameLimit;
    this.currentAnimationFrame += 1;

    if (this.frame === undefined) {
      this.currentAnimationFrame = 0
    }


  }
  

  draw(ctx) {
    const x = this.gameObject.x - utils.withGrid(2.8);
    const y = this.gameObject.y - utils.withGrid(2.8);

    this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);


    const [frameX, frameY] = this.frame;
    const frameSize=144
    this.isLoaded && ctx.drawImage(this.image,
      frameX * frameSize, frameY * frameSize,
      frameSize,frameSize,
      x,y,
      frameSize,frameSize
    )

    this.updateAnimationProgress();
  }

}