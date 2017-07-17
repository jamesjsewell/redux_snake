import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import authReducer from './authReducer';
import userReducer from './userReducer';
import navReducer from './navReducer'
import dataReducer from './dataReducer'
import gameReducer from './gameReducer'
//import communicationReducer from './communication_reducer';
//import customerReducer from './customer_reducer';
// communication: communicationReducer,
// customer: customerReducer,

const rootReducer = combineReducers({
  form: formReducer,
  auth: authReducer,
  user: userReducer,
  nav: navReducer,
  data: dataReducer,
  game: gameReducer
});

export default rootReducer;