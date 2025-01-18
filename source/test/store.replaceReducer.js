
describe('PANGjs - store.replaceReducer', () => {
    it('replace the reducer as expected', async () => {
        const { getStore } = PANGjs,
            red = (oldState, actionType, payload) => {
                if(actionType==='add'){
                    return Promise.resolve({
                        ...oldState,
                        n: oldState.n + (payload.n || 1)
                    })
                }
                return Promise.resolve(oldState)
            },
            red2 = (oldState, actionType, payload) => {
                if(actionType==='sub'){
                    return Promise.resolve({
                        ...oldState,
                        n: oldState.n - (payload.n || 1)
                    })
                }
                return Promise.resolve(oldState)
            },
            store = getStore(red, {n:0});

        await store.stage({
            type: 'add',
            payload: { n: 5 }
        }, true)
        
        expect(store.getState()).toMatchObject({ n: 5 });
        
        store.replaceReducer(red2)
        await store.stage({
            type: 'sub',
            payload: { n: 2 }
        },true)    
        expect(store.getState()).toMatchObject({ n: 3 }); 
    });

});