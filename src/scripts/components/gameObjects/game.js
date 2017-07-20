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
    Message,
    Modal
} from "semantic-ui-react"

import {
    startGame,
    pauseGame,
    resumeGame,
    endGame,
    gameOver,
    newGame,
    updateScore,
    setHighScore,
    newHighScore
} from "../../actions/gameActions.js"

//getting the date
var fullDate = new Date()
var theDate = String(fullDate).split(" ")
var theDay = theDate[2]
var theMonth = theDate[1]
var theYear = theDate[3]

const frameRate = 12

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
            newDirection: undefined,
            snakeArray: undefined,
            snakeFood: undefined,
            snakeColor: "#66ff66",
            snakeHeadColor: "#329b32",
            snakeLength: 1,
            foodColor: "#ff0000",
            wallArray: undefined,
            paused: false
        }

        this.particles = []
        this.popups = []
    }

    handleResize(gameState) {
        // var width = this.refs.child.parentNode.offsetWidth
        // var height = window.innerHeight
        // var remainder = ""
        // var gameSize = ""
        // if (width > height) {
        //     remainder = width - height
        //     if (remainder > 0) {
        //         gameSize = height
        //     } else {
        //         gameSize = width
        //     }
        // } else if (width < height) {
        //     remainder = height - width
        //     if (remainder > 0) {
        //         gameSize = width
        //     } else {
        //         gameSize = width
        //     }
        // }

        // var width = this.refs.child.parentNode.offsetWidth
        // var height = this.refs.child.parentNode.offsetHeight
        // var remainder = ""
        // var gameSize = ""
        // if (width > height) {
        //     remainder = width - height
        //     if (remainder > 0) {
        //         gameSize = height
        //     } else {
        //         gameSize = width
        //     }
        // } else if (width < height) {
        //     remainder = height - width
        //     if (remainder > 0) {
        //         gameSize = width
        //     } else {
        //         gameSize = width
        //     }
        // }

        //
        // screen: {
        //                 width: window.innerWidth,
        //                 height: window.innerHeight,
        //                 ratio: window.devicePixelRatio || 1
        //             },
        this.setState({
            screen: {
                width: window.innerWidth,
                height: window.innerHeight,
                ratio: window.devicePixelRatio || 1
            },
            gameWrapper: {
                width: this.refs.child.parentNode.offsetWidth * 0.8
            },
            tileWidth: this.refs.child.parentNode.offsetWidth * 0.8 / this.state.tileRatio
        })
    }

    handleKeys(value, e) {
        let keys = this.state.keys
        if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value
        if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value
        if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value
        if (e.keyCode === KEY.DOWN || e.keyCode === KEY.S) keys.down = value
        if (e.keyCode === KEY.SPACE) keys.space = value
        if (e.keyCode === KEY.P) keys.pause = value
        this.setState({
            keys: keys
        })
    }

    componentWillReceiveProps(nextProps) {}

    componentWillMount() {
        this.setHighScore()
    }

    componentDidMount() {
        this.handleResize("resume")
        window.addEventListener("keyup", this.handleKeys.bind(this, false))
        window.addEventListener("keydown", this.handleKeys.bind(this, true))
        window.addEventListener("resize", this.handleResize.bind(this, false))

        const context = this.refs.canvas.getContext("2d")

        this.setState({
            context: context
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

    //UPDATE NEW FRAME

    update() {
        if (this.refs.child.parentNode.offsetWidth * 0.8 != this.state.gameWrapper.width) {
            console.log("switched window size")
            this.handleResize()
        }
        var newDirection = this.state.newDirection

        if (this.state.paused) {
            this.pauseGame()
        }

        var gameOver = false
        var snakeHit = ""

        const context = this.state.context

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

        // generate snake food coords
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

            if (!this.props.lostGame && !this.state.paused) {
                var transitioned = false
                if (
                    this.state.snakeDirection === "right" &&
                    transitioned === false
                ) {
                    transitioned = true
                    headX++
                } else if (
                    this.state.snakeDirection === "left" &&
                    transitioned === false
                ) {
                    transitioned = true
                    headX--
                } else if (
                    this.state.snakeDirection === "up" &&
                    transitioned === false
                ) {
                    transitioned = true
                    headY--
                } else if (
                    this.state.snakeDirection === "down" &&
                    transitioned === false
                ) {
                    transitioned = true
                    headY++
                }
                if (this.checkCollision(headX, headY, this.state.snakeArray)) {
                    if (
                        this.state.snakeDirection &&
                        this.state.snakeArray.length > 5
                    ) {
                        if (this.state.snakeDirection === "right") headX++
                        else if (this.state.snakeDirection === "left") headX--
                        else if (this.state.snakeDirection === "up") headY--
                        else if (this.state.snakeDirection === "down") headY++
                        snakeHit = "snake"
                        gameOver = true
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
                        i === 0
                            ? this.state.snakeHeadColor
                            : this.state.snakeColor
                    )
                }
            }

            if (
                this.checkCollision(headX, headY, this.state.wallArray) &&
                !gameOver
            ) {
                if (this.state.snakeDirection) {
                    snakeHit = "wall"
                    gameOver = true
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

        this.state.snakeDirection = this.state.newDirection

        setTimeout(() => {
            requestAnimationFrame(() => {
                this.update()
            })
        }, 1000 / frameRate)

        if (gameOver === true) {
            this.gameOver(snakeHit)
        }
    }

    // CHANGE GAME STATE //

    startGame() {
        this.setHighScore()
        this.props.updateScore(1)
        this.state.snakeArray = undefined
        this.state.snakeFood = undefined
        this.state.snakeDirection = undefined
        this.state.newDirection = undefined
        this.props.startGame()
        this.handleResize()
    }

    pauseGame() {
        this.state.paused = true
        this.handleResize("paused")
        this.props.pauseGame()
    }

    endGame() {
        this.newHighScore()
        this.props.endgame()
    }

    resumeGame() {
        this.state.paused = false
        this.handleResize("resume")
        this.props.resumeGame()
    }

    gameOver(collisionWith) {
        this.newHighScore()
        this.handleResize("lost")
        this.props.gameOver(collisionWith)
    }

    addToScore(points) {
        var newScore = this.props.score + points
        this.props.updateScore(newScore)
    }

    setHighScore() {
        var highScore = ""
        if (localStorage["snakeHighScore"]) {
            var highScore = localStorage["snakeHighScore"]
            this.props.setHighScore(highScore)
        }
    }

    newHighScore() {
        if (Number(this.props.score) > Number(this.props.highScore)) {
            localStorage["snakeHighScore"] = this.props.score
            this.props.newHighScore(this.props.score)
        } else {
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
        var transitioned = false
        if (!this.state.paused) {
            if (
                this.state.keys.up &&
                this.state.snakeDirection != "down" &&
                transitioned === false
            ) {
                transitioned = true
                this.state.newDirection = "up"
            }
            if (
                this.state.keys.down &&
                this.state.snakeDirection != "up" &&
                transitioned === false
            ) {
                transitioned = true
                this.state.newDirection = "down"
            }
            if (
                this.state.keys.left &&
                this.state.snakeDirection != "right" &&
                transitioned === false
            ) {
                transitioned = true
                this.state.newDirection = "left"
            }
            if (
                this.state.keys.right &&
                this.state.snakeDirection != "left" &&
                transitioned === false
            ) {
                transitioned = true
                this.state.newDirection = "right"
            }
            if (this.state.keys.pause && !this.props.lostGame) {
                if (!this.state.paused) {
                    this.state.paused = true
                } else {
                }
            }
        }
        const gameAreaSize = this.state.gameWrapper.width
        console.log({
            width: `${this.state.screen.width}px`,
            height: `${this.state.screen.height}px`
        })
        return (
            <Modal basic open={true}>

                <Modal.Content basic>

                    <Grid>

                        <Grid.Row>

                            {this.props.lostGame || this.props.gamePaused
                                ? <Grid.Column width={4}>
                                      <Segment
                                          compact
                                          secondary
                                          size="massive"
                                          attached="left"
                                          textAlign="left"
                                          floating
                                      >
                                          {this.state.paused
                                              ? <Message floating>
                                                    <Message.Header>
                                                        <Header>
                                                            game paused
                                                        </Header>

                                                    </Message.Header>
                                                    <Divider />
                                                    <Message.Content>

                                                        <Button
                                                            primary
                                                            onClick={this.resumeGame.bind(
                                                                this
                                                            )}
                                                            content={"resume"}
                                                        />

                                                    </Message.Content>

                                                </Message>
                                              : null}
                                          {this.props.lostGame
                                              ? <div>
                                                    {" "}
                                                    {this.props.beatHighScore
                                                        ? "new high score!"
                                                        : null}

                                                    <Header>
                                                        you scored
                                                        {" "}
                                                        {this.props.score}
                                                        {" "}
                                                        {this.props.score > 1
                                                            ? "points!"
                                                            : "point!"}
                                                    </Header>

                                                    <Button
                                                        primary
                                                        onClick={() => {
                                                            this.startGame()
                                                            this.handleResize(
                                                                "resume"
                                                            )
                                                        }}
                                                        content={"play again"}
                                                    />

                                                </div>
                                              : null}

                                      </Segment>

                                  </Grid.Column>
                                : null}

                            <Grid.Column
                                width={
                                    !this.props.lostGame && !this.state.paused
                                        ? 16
                                        : 12
                                }
                            >
                                <div
                                    ref="child"
                                    style={{ width: "100%", height: "100%" }}
                                >

                                    <Segment
                                        basic
                                        className="score current-score"
                                        textAlign="center"
                                    >
                                        {this.props.lostGame
                                            ? null
                                            : <Label
                                                  tag
                                                  compact
                                                  floating
                                                  size="medium"
                                              >

                                                  <Header sub>Length</Header>
                                                  <Header size="massive">
                                                      {this.props.score}
                                                  </Header>
                                                  {" "}

                                                  <Divider />

                                                  {this.props.highScore
                                                      ? "high score: " +
                                                            this.props.highScore
                                                      : null}

                                              </Label>}

                                        <canvas
                                            ref="canvas"
                                            width={gameAreaSize}
                                            height={gameAreaSize}
                                        />

                                    </Segment>

                                </div>

                            </Grid.Column>

                        </Grid.Row>
                    </Grid>
                </Modal.Content>
            </Modal>
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
        gameOverMessage: state.game.gameOverMessage,
        gameStopped: state.game.stopped,
        highScore: state.game.highScore,
        beatHighScore: state.game.newHighScore,
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
    updateScore,
    setHighScore,
    newHighScore
})(ReduxSnake)
