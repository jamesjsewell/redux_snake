import {
	START_GAME,
	PAUSE_GAME,
	RESUME_GAME,
	END_GAME,
	GAME_OVER,
	NEW_GAME,
	ADD_TO_SCORE,
	SET_HIGH_SCORE,
	GET_HIGH_SCORE,
	NEW_HIGH_SCORE
} from "./types.js"

export function startGame() {
	return function(dispatch) {
		dispatch({ type: START_GAME, payload: "" })
	}
}

export function pauseGame() {
	return function(dispatch) {
		dispatch({ type: PAUSE_GAME, payload: "" })
	}
}

export function resumeGame() {
	return function(dispatch) {
		dispatch({ type: RESUME_GAME, payload: "" })
	}
}

export function endGame() {
	return function(dispatch) {
		dispatch({ type: END_GAME, payload: "" })
	}
}

export function gameOver() {
	return function(dispatch) {
		dispatch({ type: GAME_OVER, payload: "" })
	}
}

export function newGame() {
	return function(dispatch) {
		dispatch({ type: NEW_GAME, payload: "" })
	}
}

export function addToScore(newScore) {
	return function(dispatch) {
		dispatch({ type: ADD_TO_SCORE, payload: newScore })
	}
}

export function setHighScore(score) {
	return function(dispatch) {
		dispatch({ type: SET_HIGH_SCORE, payload: score })
	}
}

export function getHighScore() {
	var highScore = ""
	return function(dispatch) {
		dispatch({ type: GET_HIGH_SCORE, payload: highScore })
	}
}

export function newHighScore() {
	return function(dispatch) {
		dispatch({ type: NEW_HIGH_SCORE, payload: "" })
	}
}

