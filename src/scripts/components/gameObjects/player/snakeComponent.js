import Particle from "../particle/particleComponent.js"
import { rotatePoint, randomNumBetween } from "../gameHelpers"

export default class Snake {
    constructor(args) {
        this.position = args.position
        this.velocity = {
            x: 0,
            y: 0
        }
        this.rotation = 0
        this.rotationSpeed = 1.5
        this.speed = 2
        this.inertia = 0.8
        this.radius = 50
        this.create = args.create
        this.onDie = args.onDie
        this.parent = args.parent
        this.pivot = [undefined, undefined]
        this.isHead = args.isHead
        this.theHead = args.theHead
    }

    destroy() {
        this.delete = true
        this.onDie()

        // Explode
        for (let i = 0; i < 60; i++) {
            const particle = new Particle({
                lifeSpan: randomNumBetween(60, 100),
                size: randomNumBetween(1, 4),
                position: {
                    x: this.position.x +
                        randomNumBetween(-this.radius / 4, this.radius / 4),
                    y: this.position.y +
                        randomNumBetween(-this.radius / 4, this.radius / 4)
                },
                velocity: {
                    x: randomNumBetween(-1.5, 1.5),
                    y: randomNumBetween(-1.5, 1.5)
                }
            })
            this.create(particle, "particles")
        }
    }

    rotate(dir) {}

    snapToGrip(val, gridSize) {
        var snap_candidate = gridSize * Math.round(val / gridSize)
      
        if (Math.abs(val - snap_candidate) < 24) {
            return snap_candidate
        } else {
            return null
        }

       
    }

    accelerate(dir, val) {
        if (dir == "LEFT") {
            if (this.isHead) {
                this.pivot = [this.position.x, this.position.y]
                this.velocity.x = -this.speed
                this.velocity.y = 0
            }
        }
        if (dir == "RIGHT") {
            if (this.isHead) {
                this.pivot = [this.position.x, this.position.y]
                this.velocity.x = this.speed
                this.velocity.y = 0
            }
        }
        if (dir == "UP" || dir == "DOWN") {
            if (this.isHead) {
                this.pivot = [this.position.x, this.position.y]
                this.velocity.y = this.speed * val
                this.velocity.x = 0
            }
        }

        // Thruster particles
        // let posDelta = rotatePoint(
        //     { x: 0, y: -10 },
        //     { x: 0, y: 0 },
        //     (this.rotation - 180) * Math.PI / 180
        // )
        // const particle = new Particle({
        //     lifeSpan: randomNumBetween(20, 40),
        //     size: randomNumBetween(1, 3),
        //     position: {
        //         x: this.position.x + posDelta.x + randomNumBetween(-2, 2),
        //         y: this.position.y + posDelta.y + randomNumBetween(-2, 2)
        //     },
        //     velocity: {
        //         x: posDelta.x / randomNumBetween(3, 5),
        //         y: posDelta.y / randomNumBetween(3, 5)
        //     }
        // })
        // this.create(particle, "particles")
    }

    render(state) {
        // Controls
        if (state.keys.up) {
            this.accelerate("UP", -1)
        }
        if (state.keys.down) {
            this.accelerate("DOWN", 1)
        }
        if (state.keys.left) {
            this.accelerate("LEFT")
        }
        if (state.keys.right) {
            this.accelerate("RIGHT")
        }

        var snapToX = this.snapToGrip(this.velocity.x + this.position.x, 2)
        var snapToY = this.snapToGrip(this.velocity.y + this.position.y, 2)

        if (snapToX != null) {
            this.position.x = snapToX
        } else {
            this.position.x = this.position.x
        }
        if (snapToY != null) {
            this.position.y = snapToY
        } else {
            this.position.y = this.position.y
        }

        // //moving left or right and has parent
        // if (this.velocity.x > 0 && this.parent) {
        //     if (this.velocity.x < 0) {
        //         this.position.x = this.position.x - this.parent.radius
        //     } else {
        //         this.position.x = this.position.x + this.parent.radius
        //     }
        // }

        // //moving up or down and has parent
        // if (this.velocity.y > 0 && this.parent) {
        //     if (this.velocity.y < 0) {
        //         this.position.y = this.position.y - this.parent.radius
        //     } else {
        //         this.position.y = this.position.y + this.parent.radius
        //     }
        // }

        // Rotation
        if (this.rotation >= 360) {
            this.rotation -= 360
        }
        if (this.rotation < 0) {
            this.rotation += 360
        }

        // this.position.x = Math.round(this.position.x)
        // this.position.y = Math.round(this.position.y)

        // Screen edges
        if (this.position.x > state.screen.width) this.position.x = 0
        else if (this.position.x < 0) this.position.x = state.screen.width
        if (this.position.y > state.screen.height) this.position.y = 0
        else if (this.position.y < 0) this.position.y = state.screen.height

        // const particle = new Particle({
        //     lifeSpan: 10000,
        //     size: 24,
        //     position: { x: this.position.x, y: this.position.y },
        //     velocity: { x: 0, y: 0}
        // })
        // this.create(particle, "particles")

        // Draw
        const context = state.context
        context.save()
        context.translate(this.position.x, this.position.y)
        context.strokeStyle = "black"
        context.fillStyle = "green"
        context.lineWidth = 2
        context.beginPath()
        context.moveTo(0, 0)
        context.rect(-12, -12, 24, 24)
        context.closePath()

        context.stroke()
        context.restore()
    }
}
