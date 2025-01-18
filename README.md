# PANGjs (0.0.4)

![alt text](https://github.com/fedeghe/pangjs/blob/main/pangjs.png?raw=true "Pang js")

[![Coverage Status](https://coveralls.io/repos/github/fedeghe/pangjs/badge.svg?branch=main)](https://coveralls.io/github/fedeghe/pangjs?branch=main)

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
const store = PANGjs.getStore( reducer, initState );

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
    payload: { number: 4 }
}, true /* autocommit */) 
.then(console.log); // here we get autopushed state
```

alternatively it is possible to directly push the action:
``` js
store.push({
    type: 'ADD',
    payload: { number: 4 }},
)
.then(console.log); // here we get the state
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

**Parameters**: 
- **toBeChecked**:
    what needs to be checked if it is a PANGjs store or not

---

# store

Every store obtained invoking successfully `PANGjs.getStore` exposes the following:

### `storeInstance.getState() -> state`

returns the last pushed state

### `storeInstance.commit(action, autoPush) -> Promise`

commit or commit&push returning a promise resolving with new state (pushed or not); 

**Parameters**: 
- **action**:
    ```js
    {
        type: <String>,
        payload: <Object>
    }
    ```
- autoPush `<Boolean>` default `false`



### `storeInstance.push() -> Promise`
push all the committed but unpushed changes.  
Only this operations calls subscribers.  

Optionally it can recieve an action and that will be equivalent to commit and push:  
`s.commit(action).then(() => s.push())`  
act as
`s.commit(action, true)`  
and as
`s.push(action))`


### `storeInstance.subscribe(fn) -> unsubscribing function`

allows to register a subscribing function that will be invoked everytime the state changes (pushed)  

**returns**:  the unsubscribing function

### `storeInstance.replaceReducer(fn) -> store instance`

replace the store reducer

### `storeInstance.move(int) -> store instance`

in case the history is active allows to move in the states

### `storeInstance.reset() -> store instance`

reset the store to its initial state