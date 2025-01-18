# PANGjs (0.0.5)

![alt text](https://github.com/fedeghe/pangjs/blob/main/pangjs.png?raw=true "Pang js")

[![Coverage Status](https://coveralls.io/repos/github/fedeghe/pangjs/badge.svg?branch=main)](https://coveralls.io/github/fedeghe/pangjs?branch=main)

# Simple asynchronous state manager

install it 
``` sh
> npm install @fedeghe/pangjs
```
define an asynchronous reducer as:  

``` js
const reducer = async (oldState, action, payload) => {
    const res = await fetch(targetUrl);
    //
    // your updates 
    // 
    return newState
}
```
get a store and use it:

``` js  
const PANGjs = require('@fedeghe/pangjs')
const store = PANGjs.getStore( reducer, initState );

// stage the results only internally
store.stage({
        type: 'ADD',
        payload: { number: 4 }
    })
    // here we get staged state
    .then(console.log);

// make all staged changes effective
store.dispatch()
    // here we get the state
    .then(console.log);
```
alternatively one single call just adding `true` as second parameter also dispatch: 
``` js
store.stage({
    type: 'ADD',
    payload: { number: 4 }
}, true /* autoDispatch */) 
.then(console.log); // here we get the  state
```

alternatively it is possible to directly dispatch the action:
``` js
store.dispatch({
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

returns the state

### `storeInstance.stage(action, autoDispatch) -> Promise`

stage or stage&dispatch returning a promise resolving with new state (staged or not); 

**Parameters**: 
- **action**:
    ```js
    {
        type: <String>,
        payload: <Object>
    }
    ```
- autoDispatch `<Boolean>` default `false`



### `storeInstance.dispatch() -> Promise`
dispatch all the staged changes.  
Only this operations calls subscribers.  

Optionally it can recieve an action and that will be equivalent to stage and dispatch:  
`s.stage(action).then(() => s.dispatch())`  
act as
`s.stage(action, true)`  
and as
`s.dispatch(action))`


### `storeInstance.subscribe(fn) -> unsubscribing function`

allows to register a subscribing function that will be invoked everytime the state changes (dispatched)  

**returns**:  the unsubscribing function

### `storeInstance.replaceReducer(fn) -> store instance`

replace the store reducer

### `storeInstance.move(int) -> store instance`

in case the history is active allows to move in the states

### `storeInstance.reset() -> store instance`

reset the store to its initial state