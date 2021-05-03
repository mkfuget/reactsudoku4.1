import boardDataReducer from './boardDataReducer';
import cellStyleReducer from './cellStyleReducer';
import {combineReducers} from 'redux'
import selectionReducer from './selectionReducer';
import puzzleDataReducer from './puzzleDataReducer';

const rootReducer = combineReducers({
    boardDataReducer: boardDataReducer,
    cellStyleReducer: cellStyleReducer,
    selectionReducer: selectionReducer,
    puzzleDataReducer: puzzleDataReducer
})

export default rootReducer;