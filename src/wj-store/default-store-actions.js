const addAction = (stateValueName) => {
    return (payload2)=>{
        return {
            type: `${stateValueName}/ADD` ,
            payload: payload2
        }
    }
}

const addManyAction = (stateValueName) => {
    return (payload2)=>{
        return {
            type: `${stateValueName}/ADD_MANY` ,
            payload: payload2
        }
    }
}

const updateAction = (stateValueName) => {
    return (payload2)=>{
        return {
            type: `${stateValueName}/UPDATE` ,
            payload: payload2
        }
    }
}

const deleteAction = (stateValueName) => {
    return (payload2)=>{
        return {
            type: `${stateValueName}/DELETE` ,
            payload: payload2
        }
    }
}

const loadAction = (stateValueName) => {
    return (payload2)=>{
        return {
            type: `${stateValueName}/LOAD` ,
            payload: payload2
        }
    }
}

const defaultStoreActions = {
    addAction,
    deleteAction,
    loadAction,
    updateAction,
    addManyAction
};

export {defaultStoreActions}