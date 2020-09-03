export const loginUser = () => {
    return {
        type: "LOG_IN"
    }
}

export const logoutUser = () => {
    return {
        type: "LOG_OUT"
    }
}

export const setUid = (data) => {
    return {
        type: "SAVE",
        payload: data
    }
}

export const resetUid = () => {
    return {
        type: "RESET"
    }
}

export const setTarget = (data) => {
    return {
        type: "SETTARGET",
        payload: data,
    }
}

export const resetTarget = () => {
    return {
        type : "RESETTARGET"
    }
}

export const setRoom = (data) => {
    return {
        type: "SET_ROOM",
        payload: data
    }
}

export const resetRoom = () => {
    return {
        type: "RESET_ROOM"
    }
}

export const setUser = (data) => {
    return {
        type: "SET_USER",
        payload: data
    }
}

export const resetUser = () => {
    return {
        type: "RESET_USER"
    }
}