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
    Divider,
    Label,
    Message
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
    newHighScore
} from "../../actions/gameActions.js"

//getting the date
var fullDate = new Date()
var theDate = String(fullDate).split(" ")
var theDay = theDate[2]
var theMonth = theDate[1]
var theYear = theDate[3]

const frameRate = 10

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
            snakeDirection: undefined,
            snakeArray: undefined,
            snakeFood: undefined,
            snakeColor: "#66ff66",
            snakeLength: 1,
            foodColor: "#ff0000",
            wallArray: undefined,
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

    componentWillReceiveProps(nextProps) {}

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
            if (!this.props.gamePaused) {
                this.pauseGame()
            } else {
                this.resumeGame()
            }
        }

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

        // generate snake coords
        if (!this.state.snakeArray) {
            this.createSnake()
        }

        // generate wall coords
        if (!this.state.wallArray) {
            this.createWalls()
        }

        if (!this.state.snakeFood) {
            this.generateFood()
        }

        //place wall tiles
        for (var brick = 0; brick < this.state.wallArray.length; brick++) {
            this.placeTile(
                this.state.wallArray[brick].x,
                this.state.wallArray[brick].y,
                "grey"
            )
        }

        //snake movement
        if (this.state.snakeArray) {
            var headX = this.state.snakeArray[0].x
            var headY = this.state.snakeArray[0].y

            if (this.state.snakeDirection === "right") headX++
            else if (this.state.snakeDirection === "left") headX--
            else if (this.state.snakeDirection === "up") headY--
            else if (this.state.snakeDirection === "down") headY++

            if (!this.props.lostGame && !this.props.gamePaused) {
                if (this.checkCollision(headX, headY, this.state.snakeArray)) {
                    if (this.state.snakeDirection) {
                        this.props.gameOver()
                    }
                }

                //checks if snake is eating food and animates snake
                if (
                    headX == this.state.snakeFood.x &&
                    headY == this.state.snakeFood.y
                ) {
                    var tail = { x: headX, y: headY }
                    this.addToScore(1)

                    this.generateFood()
                } else {
                    if (this.state.snakeDirection) {
                        var tail = this.state.snakeArray.pop()
                        tail.x = headX
                        tail.y = headY
                    }
                }

                if (this.state.snakeDirection) {
                    this.state.snakeArray.unshift(tail)
                }
            }

            //draws snake
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

            if (this.checkCollision(headX, headY, this.state.wallArray)) {
                if (this.state.snakeDirection) {
                    this.gameOver()
                }
            }

            // generate snake food coords
            if (this.state.snakeFood) {
                this.placeTile(
                    this.state.snakeFood.x,
                    this.state.snakeFood.y,
                    this.state.foodColor
                )
            }
        }

        context.restore()

        setTimeout(() => {
            requestAnimationFrame(() => {
                this.update()
            })
        }, 1000 / frameRate)
    }

    // CHANGE GAME STATE //

    startGame() {
        this.setHighScore()
        this.state.snakeArray = undefined
        this.state.snakeFood = undefined
        this.state.snakeDirection = undefined
        this.props.startGame()
    }

    newGame() {
        this.props.setHighScore()
        this.props.newGame()
    }

    pauseGame() {
        this.props.pauseGame()
    }

    endGame() {
        this.newHighScore()
        this.props.endgame()
    }

    resumeGame() {
        this.props.resumeGame()
    }

    gameOver() {
        this.newHighScore()
        this.props.gameOver()
    }

    addToScore(points) {
        var newScore = this.props.score + points
        this.props.addToScore(newScore)
    }

    setHighScore() {
        var highScore = ""
        this.props.setHighScore(highScore)
    }

    newHighScore() {
        if (this.props.score > this.props.highScore) {
            localStorage["snakeHighScore"] = this.props.score
            this.props.newHighScore(this.props.score)
        }
    }

    // GAME ENTITY LOGIC //

    generateFood() {
        var wall = this.state.gameWrapper.width / this.state.tileWidth - 2
        var max = Math.floor(wall)
        var min = Math.ceil(1)
        this.state.snakeFood = {
            x: Math.floor(Math.random() * (max - min) + min),
            y: Math.floor(Math.random() * (max - min) + min)
        }
    }

    createSnake() {
        var length = this.state.snakeLength
        var snakeArray = []

        for (var i = length - 1; i >= 0; i--) {
            //This will create a horizontal snake starting from the top left
            snakeArray.push({ x: i + 2, y: 2 })
        }

        this.state.snakeArray = snakeArray
    }

    createWalls() {
        var wallArray = []

        var wallLength = this.state.gameWrapper.width / this.state.tileWidth - 1
        console.log(wallLength)

        for (var brick = 0; brick < wallLength; brick++) {
            wallArray.push({ x: brick, y: 0 })
        }

        for (var brick = 0; brick < wallLength; brick++) {
            wallArray.push({ x: wallLength, y: brick })
        }

        for (var brick = wallLength; brick > 0; brick--) {
            wallArray.push({ x: brick, y: wallLength })
        }

        for (var brick = wallLength; brick > 0; brick--) {
            wallArray.push({ x: 0, y: brick })
        }

        this.state.wallArray = wallArray
    }

    placeTile(x, y, color) {
        const tw = this.state.tileWidth

        this.state.context.fillStyle = color
        this.state.context.fillRect(x * tw, y * tw, tw, tw)
        this.state.context.strokeStyle = "white"
        this.state.context.strokeRect(x * tw, y * tw, tw, tw)
        this.state.context.save()
        this.state.context.restore()
    }

    checkCollision(x, y, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].x == x && array[i].y == y) {
                return true
            }
        }
        return false
    }

    render() {
        //let endgame
        //let message
        //   if (this.state.currentScore <= 0) {
        //     message = "0 points... So sad."
        // } else if (this.state.currentScore >= this.state.topScore) {
        //     message =
        //         "Top score with " + this.state.currentScore + " points. Woo!"
        // } else {
        //     message = this.state.currentScore + " Points though :)"
        // }

        // if (!this.state.inGame) {
        //     endgame = (
        //         <div className="endgame">
        //             <p>Game over!</p>
        //             <p>{message}</p>
        //             <button onClick={this.startGame.bind(this)}>
        //                 try again?
        //             </button>
        //         </div>
        //     )
        // }
        // if (!this.state.dataLoaded && this.state.inGame) {
        //     var loading = (
        //         <div className="endgame">
        //             <p>Loading</p>
        //         </div>
        //     )
        // }
        //{endgame}

        // switch (action.type) {
        // case START_GAME: {

        // }

        const gameAreaSize = this.state.gameWrapper.width
            ? this.state.gameWrapper.width
            : 400
        return (
            <div ref="child">
                <Segment
                    secondary
                    size="massive"
                    attached="top"
                    textAlign="left"
                >
                    {this.props.lostGame
                        ? <Message negative compact floating>
                              <Message.Header>
                                  Game Over!
                              </Message.Header>
                              <Button
                                  onClick={this.startGame.bind(this)}
                                  content={"play again"}
                              />
                          </Message>
                        : null}

                    <Label floating>{this.props.score} </Label>

                </Segment>
                <Segment
                    secondary
                    attached
                    className="score current-score"
                    textAlign="center"
                >

                    <canvas
                        ref="canvas"
                        width={gameAreaSize}
                        height={gameAreaSize}
                    />

                </Segment>

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
        lostGame: state.game.over,
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
    newHighScore
})(ReduxSnake)
