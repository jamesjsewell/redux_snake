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
} from "../actions/types.js"

import _ from "underscore"

const INITIAL_STATE = {
	new: true,
	paused: false,
	ready: true,
	inAction: false,
	over: false,
	stopped: true,
	highScore: undefined,
	newHighScore: undefined,
	score: undefined
}

export default function(state = INITIAL_STATE, action) {
	switch (action.type) {
		case START_GAME: {
			return _.extend({}, state, { new: true, newHighScore: false, inAction: true })
		}

		case PAUSE_GAME: {
			return _.extend({}, state, {
				paused: true,
				inAction: false,
				over: false
			})
		}

		case RESUME_GAME: {
			return _.extend({}, state, {
				paused: false,
				inAction: true,
				over: false
			})
		}

		case GAME_OVER: {
			return _.extend({}, state, {
				paused: false,
				inAction: true,
				over: true,
				stopped: false,
				ready: false,
				new: false
			})
		}

		case END_GAME: {
			return _.extend({}, state, {
				paused: false,
				inAction: false,
				over: false,
				stopped: true,
				ready: true,
				new: false
			})
		}

		case NEW_GAME: {
			return _.extend({}, state, {
				paused: false,
				inAction: true,
				over: false,
				stopped: false,
				ready: false,
				new: true,
				newHighScore: false
			})
		}

		case ADD_TO_SCORE: {
			return _.extend({}, state, { score: action.payload })
		}

		case SET_HIGH_SCORE: {
			return _.extend({}, state, { highScore: action.payload })
		}

		case GET_HIGH_SCORE: {
			return _.extend({}, state, { highScore: action.payload })
		}

		case NEW_HIGH_SCORE: {
			return _.extend({}, state, { newHighScore: true })
		}
	}

	return state
}
