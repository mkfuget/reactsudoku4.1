const puzzleDataReducer = (state =
    {
        puzzleData: "none",
    }, action) =>
{
    switch(action.type)
    {
        case 'LOAD_PUZZLE_DATA':
            return {puzzleData: action.payload}
        default: 
            return state;
    }
}

export default puzzleDataReducer;