import React, { Component } from "react"
import { connect } from "react-redux"
import Backbone from "backbone"
import $ from "jquery"
import moment from "moment"
import "moment/locale/pt-br"
import {
    Button,
    Grid,
    Segment,
    Input,
    Container,
    Header,
    Divider
} from "semantic-ui-react"

import {
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    gameOver,
    newGame,
    addToScore,
    setHighScore,
    getHighScore,
    newHighScore
} from "../../actions/gameActions.js"

//getting the date
var fullDate = new Date()
var theDate = String(fullDate).split(" ")
var theDay = theDate[2]
var theMonth = theDate[1]
var theYear = theDate[3]

const KEY = {
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    A: 65,
    D: 68,
    W: 87,
    S: 83,
    P: 80,
    SPACE: 32
}

class ReduxSnake extends Component {
    constructor() {
        super()
        this.state = {
            screen: {
                width: window.innerWidth,
                height: window.innerHeight,
                ratio: 1
            },
            gameWrapper: {
                width: undefined
            },
            tileWidth: undefined,
            tileRatio: 24,
            context: null,
            keys: {
                left: 0,
                right: 0,
                up: 0,
                down: 0,
                space: 0
            },
            currentScore: 0,
            topScore: localStorage["topscore"] || 0,
            inGame: false,
            snakeDirection: "right",
            snakeArray: [],
            snakeFood: {},
            snakeColor: "#66ff66",
            snakeLength: 1,
            foodColor: "#ff0000",
            paused: false
        }

        this.particles = []
        this.popups = []
    }

    handleResize(value, e) {
        this.setState({
            screen: {
                width: window.innerWidth,
                height: window.innerHeight,
                ratio: window.devicePixelRatio || 1
            },
            gameWrapper: {
                width: this.refs.child
                    ? this.refs.child.parentNode.offsetWidth * 0.8
                    : undefined
            },
            tileWidth: this.refs.child.parentNode.offsetWidth *
                0.8 /
                this.state.tileRatio
        })
    }

    handleKeys(value, e) {
        let keys = this.state.keys
        if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value
        if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value
        if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value
        if (e.keyCode === KEY.DOWN || e.keyCode === KEY.S) keys.down = value
        if (e.keyCode === KEY.SPACE) keys.space = value
        if (e.keyCode === KEY.P || e.keyCode === KEY.SPACE) keys.pause = value
        this.setState({
            keys: keys
        })
    }

    componentDidMount() {
        window.addEventListener("keyup", this.handleKeys.bind(this, false))
        window.addEventListener("keydown", this.handleKeys.bind(this, true))
        window.addEventListener("resize", this.handleResize.bind(this, false))

        const context = this.refs.canvas.getContext("2d")

        this.setState({
            context: context,
            gameWrapper: {
                width: this.refs.child
                    ? this.refs.child.parentNode.offsetWidth * 0.8
                    : undefined
            },
            tileWidth: this.refs.child.parentNode.offsetWidth *
                0.8 /
                this.state.tileRatio
        })

        this.startGame()

        window.requestAnimationFrame =
            window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(f) {
                return setTimeout(f, 1000 / 60)
            }

        window.cancelAnimationFrame =
            window.cancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            function(requestID) {
                clearTimeout(requestID)
            } //fall back

        requestAnimationFrame(() => {
            this.update()
        })
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleKeys)
        window.removeEventListener("resize", this.handleKeys)
        window.removeEventListener("resize", this.handleResize)
    }

    componentWillMount() {}

    //UPDATE NEW FRAME

    update() {
        const context = this.state.context
        const keys = this.state.keys

        if (this.state.keys.up && this.state.snakeDirection != "down") {
            this.state.snakeDirection = "up"
        }
        if (this.state.keys.down && this.state.snakeDirection != "up") {
            this.state.snakeDirection = "down"
        }
        if (this.state.keys.left && this.state.snakeDirection != "right") {
            this.state.snakeDirection = "left"
        }
        if (this.state.keys.right && this.state.snakeDirection != "left") {
            this.state.snakeDirection = "right"
        }
        if (this.state.keys.pause) {
            this.state.paused = true
        }

        if (context != null) {
            context.save()
            context.scale(1, 1)

            context.globalAlpha = 0.4
            context.fillRect(
                0,
                0,
                this.state.gameWrapper.width,
                this.state.gameWrapper.width
            )
            context.clearRect(
                0,
                0,
                this.state.gameWrapper.width,
                this.state.gameWrapper.width
            )
            context.globalAlpha = 1

            //The movement code for the snake to come here.
            //The logic is simple
            //Pop out the tail cell and place it infront of the head cell

            if (this.state.snakeArray[0]) {
                var headX = this.state.snakeArray[0].x
                var headY = this.state.snakeArray[0].y
                //These were the position of the head cell.
                //We will increment it to get the new head position
                //Lets add proper direction based movement now
                if (this.state.snakeDirection === "right") headX++
                else if (this.state.snakeDirection === "left") headX--
                else if (this.state.snakeDirection === "up") headY--
                else if (this.state.snakeDirection === "down") headY++

                //Lets add the game over clauses now
                //This will restart the game if the snake hits the wall
                //Lets add the code for body collision
                //Now if the head of the snake bumps into its body, the game will restart
                if (
                    headX == -1 ||
                    headX ==
                        this.state.gameWrapper.width / this.state.tileWidth ||
                    headY == -1 ||
                    headY ==
                        this.state.gameWrapper.width / this.state.tileWidth ||
                    this.checkCollision(headX, headY, this.state.snakeArray)
                ) {
                    //restart game
                    //init()
                    //Lets organize the code a bit now.
                }

                //Lets write the code to make the snake eat the food
                //The logic is simple
                //If the new head position matches with that of the food,
                //Create a new head instead of moving the tail
                if (
                    headX == this.state.snakeFood.x &&
                    headY == this.state.snakeFood.y
                ) {
                    var tail = { x: headX, y: headY }
                    //score++

                    //Create new food
                    this.generateFood()
                } else {
                    if (this.state.snakeArray) {
                        var tail = this.state.snakeArray.pop() //pops out the last cell
                        tail.x = headX
                        tail.y = headY
                    }
                }
                //The snake can now eat the food.

                this.state.snakeArray.unshift(tail) //puts back the tail as the first cell

                for (var i = 0; i < this.state.snakeArray.length; i++) {
                    var snakeTile = this.state.snakeArray
                        ? this.state.snakeArray[i]
                        : undefined

                    if (snakeTile) {
                        this.placeTile(
                            snakeTile.x,
                            snakeTile.y,
                            this.state.snakeColor
                        )
                    }
                }

                //Lets paint the food
                if (this.state.snakeFood.x) {
                    this.placeTile(
                        this.state.snakeFood.x,
                        this.state.snakeFood.y,
                        this.state.foodColor
                    )
                } else {
                    this.generateFood()
                }

                //Lets paint the score
                // var score_text = "Score: " + score
                // var level_text = "Level: " + level
                // ctx.fillText(score_text, 5, h - 5)
                // ctx.fillText(level_text, 60, h - 5)
            }

            context.restore()

            setTimeout(() => {
                //throttle requestAnimationFrame to 20fps

                requestAnimationFrame(() => {
                    this.update()
                })
            }, 1000 / 10)
        }
    }

    // CHANGE GAME STATE //

    addScore(points) {
        if (this.state.inGame) {
            this.setState({
                currentScore: this.state.currentScore + points
            })
        }
    }

    startGame() {
        this.setState({
            inGame: true,
            currentScore: 0
        })

        // generate snake
        if (!this.state.snakeArray[0]) {
            this.createSnake()
        }

        // generate food
        if (!this.state.snakeFood.x) {
            this.generateFood()
        }
    }

    newGame() {}

    pauseGame() {}

    endGame() {}

    resumeGame() {}

    gameOver() {
        this.setState({
            inGame: false,
            dataLoaded: false
        })

        // Replace top score
        if (this.state.currentScore > this.state.topScore) {
            this.setState({
                topScore: this.state.currentScore
            })
            localStorage["topscore"] = this.state.currentScore
        }
    }

    // GAME ENTITY LOGIC //

    generateFood() {
        this.state.snakeFood = {
            x: Math.round(
                Math.random() *
                    (this.state.gameWrapper.width - this.state.tileWidth) /
                    this.state.tileWidth
            ),
            y: Math.round(
                Math.random() *
                    (this.state.gameWrapper.width - this.state.tileWidth) /
                    this.state.tileWidth
            )
        }
    }

    createSnake() {
        var length = 4
        var snakeArray = []

        for (var i = length - 1; i >= 0; i--) {
            //This will create a horizontal snake starting from the top left
            snakeArray.push({ x: i, y: 0 })
        }

        this.state.snakeArray = snakeArray
    }

    //  CREATE AND UPDATE //

    placeTile(x, y, color) {
        const tw = this.state.tileWidth

        this.state.context.fillStyle = color
        this.state.context.fillRect(x * tw, y * tw, tw, tw)
        this.state.context.strokeStyle = "white"
        this.state.context.strokeRect(x * tw, y * tw, tw, tw)
        this.state.context.save()
        this.state.context.restore()
    }

    // COLLISIONS LOGIC //

    checkCollision(x, y, array) {
        //This function will check if the provided x/y coordinates exist
        //in an array of cells or not
        for (var i = 0; i < array.length; i++) {
            if (array[i].x == x && array[i].y == y) {
                return true
            }
        }
        return false
    }

    render() {
        let endgame
        let message

        if (this.state.currentScore <= 0) {
            message = "0 points... So sad."
        } else if (this.state.currentScore >= this.state.topScore) {
            message =
                "Top score with " + this.state.currentScore + " points. Woo!"
        } else {
            message = this.state.currentScore + " Points though :)"
        }

        if (!this.state.inGame) {
            endgame = (
                <div className="endgame">
                    <p>Game over!</p>
                    <p>{message}</p>
                    <button onClick={this.startGame.bind(this)}>
                        try again?
                    </button>
                </div>
            )
        }
        if (!this.state.dataLoaded && this.state.inGame) {
            var loading = (
                <div className="endgame">
                    <p>Loading</p>
                </div>
            )
        }
        const gameAreaSize = this.state.gameWrapper.width
            ? this.state.gameWrapper.width
            : 400
        return (
            <div ref="child">

                {endgame}
                <Header className="score current-score">
                    length: {this.state.snakeLength}
                </Header>
                <Header sub className="score top-score">
                    high score: {this.state.topScore}
                </Header>

                <Divider />

                <canvas
                    style={{ border: `4px solid grey` }}
                    ref="canvas"
                    width={gameAreaSize}
                    height={gameAreaSize}
                />

            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        newGame: state.game.new,
        gamePaused: state.game.paused,
        gameReady: state.game.ready,
        gameInAction: state.game.inAction,
        gameOver: state.game.over,
        gameStopped: state.game.stopped,
        highScore: state.game.highScore,
        newHighScore: state.game.newHighScore,
        score: state.game.score
    }
}

export default connect(mapStateToProps, {
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    gameOver,
    newGame,
    addToScore,
    setHighScore,
    getHighScore,
    newHighScore
})(ReduxSnake)
