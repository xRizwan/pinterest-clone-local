const targetReducer = (state = [], action) => {
    switch(action.type){
        case "SETTARGET":
            return [action.payload];
        case "RESETTARGET":
            return [];
        default:
            return state;
    }
}

export default targetReducer;