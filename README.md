# PANGjs

![alt text](./pangjs.png "Pang js")


# Simple asynchronous state manager

install it 
``` sh
> npm install pangjs
```

All we need to do now is to:  
- define an asynchronous reducer as:
    ``` js
    const reducer = async (oldState, action, payload) => {
        const res = await fetch(targetUrl),
            newstate = {
                ...oldState,
                // your updates
            }
        return newState
    }
    ```


now it's time to get a store and use it:


``` js
const store = PANGjs.getStore( reducer, initState );
// commit, change it only internally
store.commit({type: 'ADD', payload: { number: 4 }})
    .then(s => console.log('here we get the unpushed state:', s));
// to push the changes to be effective we have to push
store.push()
    .then(s => console.log('here we get the pushed state (nothing unpushed):', s));
```
alternatively one single call just adding `true` as second parameter (semantically is 'autocommit'): 
``` js
store.commit(
    {type: 'ADD', payload: { number: 4 }},
    true
).then(s => console.log('here we get autopushed state:', s));
```

## API  

## PANGjs.getStore(reducer, initialState) -> store

**Parameters**: 
- `reducer`:  
    the `reducer` function expected to have the following signature:  

    `(oldState, actionType, payload) => Promise`    

     where the returning promise resolves with the updated state.

- `initialState`:  
    optional object representing the initial state needed; when not provided it will be just an empty object.

**Returns**:  
the `store` instance  

**Throws**:  
"[ERROR] Reducer should return something!" in case the passed reducer is not a function

## PANGjs.isStore(something)

Parameters: 
- **something**:
    what needs to be checked if it is a PANGjs store or not