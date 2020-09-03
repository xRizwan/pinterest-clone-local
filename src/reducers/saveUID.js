const uidReducer = (state = '', action) => {
    switch(action.type){
        case ('SAVE'):
            return action.payload;
        case ("RESET"):
            return '';
        default: 
            return state;
    }
}

export default uidReducer;