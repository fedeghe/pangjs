# PANGjs (0.0.1)

![alt text](https://github.com/fedeghe/pangjs/blob/main/pangjs.png?raw=true "Pang js")


# Simple asynchronous state manager

install it 
``` sh
> npm install @fedeghe/pangjs
```

All we need to do now is to:  
- define an asynchronous reducer as:
    ``` js
    const reducer = async (oldState, action, payload) => {
        const res = await fetch(targetUrl);
        //
        // your updates 
        // 
        return newState
    }
    ```


now it's time to get a store and use it:


``` js
const store = PANGjs.getStore(
    reducer,
    initState
);

// commit, change it only internally
store.commit({
        type: 'ADD',
        payload: { number: 4 }
    })
    .then(s => console.log(
        'here we get the unpushed state:', s
    ));

// for the changes to be effective we have to push
store.push()
    // here we get the pushed state
    .then(console.log);
```
alternatively one single call just adding `true` as second parameter (semantically is 'autocommit'): 
``` js
store.commit({
        type: 'ADD',
        payload: { number: 4 }},
        true // autoCommit changes
    )
    // here we get autopushed state
    .then(console.log);
```

alternatively it is possible to directly push the action:
``` js
store.push({
    type: 'ADD',
    payload: { number: 4 }},
)
// here we get the state
.then(console.log);
```

---

# API

### `PANGjs.getStore(reducer, initialState, config) -> store`

**Parameters**: 
- `reducer`:  
    the `reducer` function expected to have the following signature:  

    `(oldState, actionType, payload) => Promise`    

     where the returning promise resolves with the updated state.

- `initialState`:  
    optional object representing the initial state needed; when not provided it will be just an empty object.

- `config`:  this is an optional object allowing to change some default behaviors:
    - maxElements (default 1): 
        by default no history is available, but if here we pass a number bigger than one, for example 5 then we can navigate the state back up to 5 steps using the `move` function to the store.
    - check (default no check):
        here we can pass a synchrhonous function expected to have to following signature:
        ```
        (
            state, 
            currentAction,
            previousAction,
            payload
        ) -> <Boolean>
        ```
        allowing to prevent a state change under some circumstances; that decision can be made based on the `state`, the ongoing `currentAction` which we might block, the `previousAction` and the current `payload`. Only if we return `true`, the reducer action will be run.

**Returns**:  
the `store` instance  

**Throws**:  
`[ERROR] Reducer should return something!` in case the passed reducer is not a function

---

### `PANGjs.combine([reducer, ...])`

Synchronous function to combine 2 or more reducers.

**Parameters**:
- **[reducer, ...]**:
    two or more reducers to be combined

**Returns**:  
the resulting combined reducer

**Throws**:  
`[ERROR] Reducer must be a function!` in case one of the parameters is not a function  

---

### `PANGjs.isStore(toBeChecked)`

Parameters: 
- **toBeChecked**:
    what needs to be checked if it is a PANGjs store or not

---

# store API

Every store obtained invoking successfully `PANGjs.getStore` exposes the following (more details will come):

### `storeInstance.getState() -> state (last pushed)`

### `storeInstance.commit(action, autoPush) -> Promise resolved with new state (pushed or not)`

### `storeInstance.push() -> Promise resolved with new pushed state`
- calls subscribers 

### `storeInstance.suubscribe(fn) -> unsubscribing function`

### `storeInstance.replaceReducer(fn) -> store instance`

### `storeInstance.move(int) -> store instance`

### `storeInstance.reset() -> store instance`