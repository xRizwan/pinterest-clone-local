const roomReducer = (state = [], action) => {
    switch(action.type){
        case "SET_ROOM":
            return action.payload;
        case "RESET_ROOM":
            return [];
        default:
            return state;
    }
}

export default roomReducer;