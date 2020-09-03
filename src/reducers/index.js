import logReducer from './isLogged';
import uidReducer from './saveUID';
import targetReducer from './targetReducer';
import roomReducer from './roomReducer';
import userReducer from './userReducer';
import { combineReducers } from 'redux';

const allReducers = combineReducers({
    isLogged: logReducer,
    userID : uidReducer,
    target : targetReducer,
    room: roomReducer,
    user: userReducer
})

export default allReducers;