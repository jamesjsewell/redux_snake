export default class Particle {
  constructor(args) {
    this.position = args.position
    this.velocity = args.velocity
    this.size = args.size;
    this.lifeSpan = args.lifeSpan;
    this.inertia = 1.4;
    this.color = args.color
  }

  destroy(){
    this.delete = true;
  }

  render(state){
    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;

    // Shrink
    this.size -= 0.1;
    if(this.size < 0.1) {
      this.size = 0.1;
    }
    if(this.lifeSpan-- < 0){
      this.destroy()
    }

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.fillStyle = this.color;
    context.lineWidth = 2;
    context.beginPath();
    context.fillRect(0, 0, this.size * .4, this.size * .4)
    context.closePath();
    context.fill();
    context.restore();
  }
}
