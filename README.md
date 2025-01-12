# PANGjs

![alt text](./pangjs.png "Pang js")


Simple asynchronous state manager:
``` js
const store = PANGjs.getStore(
    // reducer
    (oldState, actionType, payload) => {
        return new Promise( resolve => {
            switch(actionType) {
                case 'ADD':
                    resolve({
                        number: oldState.numer + payload.number
                    });
                case 'SUB':
                    resolve({
                        number: oldState.numer - payload.number
                    });
            }
            return oldState;
        })
        
    },

    // initial State
    { number: 0 }
)
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