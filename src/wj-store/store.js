import PubSub from './pubsub.js';
import { defaultStoreActions } from './default-store-actions.js';

class Store {
   
    
    constructor(params = {}) {
        this._isPause = false;
        this._state = {};
        this._reducer = function rootReducer(state = {}, action){
            return {}
        };


        // A status enum to set during actions and mutations
        this.status = 'resting';

        // Attach our PubSub module as an `events` element
        this.events = new PubSub();

        if(params.hasOwnProperty('reducer')) {
            this._reducer = params.reducer;
        }

        this.refreshProxy(params.state)
    }

    /**
     * A dispatcher for actions that looks in the actions 
     * collection and runs the action if it can find it
     *
     * @param {string} actionKey
     * @param {mixed} payload
     * @returns {boolean}
     * @memberof Store
     */
    dispatch(action) {
        // Create a console group which will contain the logs from our Proxy etc
        // console.groupCollapsed(`ACTION: ${action.type}`);
        
        // Let anything that's watching the status know that we're dispatching an action
        this.status = 'action';

        let newState =  this._reducer(this._state, action);

        this.status = 'mutation';
        // Merge the old and new together to create a new state and set it
        this._state = Object.assign(this._state, newState);

        // Close our console group to keep things nice and neat
        // console.groupEnd();

        return true;
    }

    getState(){
        return JSON.parse(JSON.stringify(this._state))
    }

    subscribe(eventName, callbackFn)  {
        return this.events.subscribe(eventName, callbackFn)
    }

    unsubscribe(eventName)  {
        delete this.events[eventName];
    }

    pause(){
        this._isPause = true;

        return this;
    }

    play(val){
        this._isPause = false;

        return this;
    }

    mergeReducers(stateValueName, newReducer){
        let reducerCopy = this._reducer;
		/*
        this._reducer = (state, newState) => {
            let preState = reducerCopy(state, newState);
            let result = {
                ...preState,
                [stateValueName]: newReducer(state[stateValueName], newState)
            };
            return result;
        }
		*/
    }

    makeEveryArrayEntryAsStoreState(storeKey, array = [], identificator = 'id') {
        array.forEach((entry) => {
            if(this.getState().hasOwnProperty(`${storeKey}-${entry[identificator]}`)){
                this.dispatch(defaultStoreActions.updateAction(`${storeKey}-${entry[identificator]}`)(entry))
            } else {
                this.define(`${storeKey}-${entry.id || entry.source || entry[identificator]}`, entry, null, identificator);
            }
        });

        // array.forEach((entry) => {
        //     this.define(`${storeKey}-${entry[identificator]}`, entry, null, identificator);
        // });
    }

    define(stateValueName, defaultValue, reducer, key = "id"){
        if(this._state.hasOwnProperty(stateValueName)){
            console.warn(`STATE už obsahuje premennú ${stateValueName},ktorú sa pokúšate pridať`)
            return
        }

        if(reducer instanceof Function){
            this.mergeReducers(stateValueName, reducer)
        } else {
            if(defaultValue instanceof Array){
                this.mergeReducers(stateValueName, this.createArrayReducer(stateValueName, key) )
            } else {
                this.mergeReducers(stateValueName, this.createObjectReducer(stateValueName, key) )
            }
        }
/*
        this.refreshProxy({
            ...this._state,
            [stateValueName]: defaultValue
        })
		*/
    }

    refreshProxy(state){
        // Set our state to be a Proxy. We are setting the default state by
        // checking the params and defaulting to an empty object if no default
        // state is passed in
        this._state = new Proxy((state || {}), {
            set: (state, key, value) => {
                if(JSON.stringify(state[key]) === JSON.stringify(value)){
                    return true
                }

                //Set the value as we would normally
                let oldState = state[key]
                state[key] = value;

                // Trace out to the console. This will be grouped by the related action
                // console.log(`stateChange: ${key}: `, value);

                // TODO vieme to rozšíríť a subscripe sa len na zmenu určitej časti statu
                // Publish the change event for the components that are listening
                if(!this._isPause)
                    this.events.publish(key, this._state, oldState);

                // Give the user a little telling off if they set a value directly
                if(this.status !== 'mutation') {
                    console.warn(`You should use a mutation to set ${key}`);
                }

                // Reset the status ready for the next operation
                this.status = 'resting';

                return true;
            }
        });
    }

    createObjectReducer(stateValueName){
        /*return (state = {},action)=>{
            switch (action.type) {
                case `${stateValueName}/ADD`:
                    return {
                        ...action.payload
                    }
                case `${stateValueName}/UPDATE`:
                    return {
                        ...state,
                        ...action.payload
                    }
                case `${stateValueName}/DELETE`:
                    return {}
                default:
                    return state
            }
        }
		*/
    }

    createArrayReducer(stateValueName, key){
		/*
        return (state = [],action)=>{
            switch (action.type) {
                case `${stateValueName}/ADD`:
                    if(Array.isArray(action.payload)){
                        return [
                            ...state,
                            ...action.payload
                        ]
                    } else {
                        return [
                            ...state,
                            action.payload
                        ]
                    }
                case `${stateValueName}/ADD_MANY`:
                    return [
                        ...state,
                        ...action.payload
                    ]
                case `${stateValueName}/UPDATE`:
                    
                    if(state.some(obj => obj[key] == action.payload[key])){
                        return [
                            ...state.map(obj => {
                            if(obj[key] == action.payload[key]){
                                return action.payload
                            }
                            return obj
                        })];
                    }else{
                        return [...state,
                            action.payload
                            ];
                    }
                case `${stateValueName}/DELETE`:
                    return [
                        ...state.filter(obj => (obj.hasOwnProperty(key) && (obj[key] != action.payload[key])) ||  (!obj.hasOwnProperty(key) && obj != action.payload))
                    ]

                case `${stateValueName}/LOAD`:
                    return [
                        ...action.payload
                    ]
                default:
                    return state
            }
        }
		*/
    }
}

let store = new Store();
export { store, defaultStoreActions };