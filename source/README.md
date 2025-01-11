# PANGjs

Simple asynchronous state manager:
``` js
const store = PANGjs.getStore(
    // reducer
    (oldState, actionType, payload) => {
        switch(actionType) {
            case 'ADD':
                return Promise.resolve({
                    number: oldState.numer
                        + payload.number
                });
            case 'SUB':
                return Promise.resolve({
                    number: oldState.numer
                        - payload.number
                });
        }
        return oldState;
    },

    // initial State
    { number: 0 }
)
// commit, change it only internally
store.commit({type: 'ADD', payload: { number: 4 }});
// to push the changes to be effective we have to push
store.push();
```
as alternative one can do everithung in one call just adding `true` as second parameter (semantically is 'autocommit'): 
``` js
store.commit({type: 'ADD', payload: { number: 4 }}, true);
```