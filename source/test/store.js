
describe('PANGjs - store', () => {
    it('store chain', async () => {
        const delay = 1e3,
            { getStore } = PANGjs,
            reducer = (
                oldState,
                actionType,
                payload
            ) => new Promise(
                resolve => 
                    setTimeout(() => {
                        switch(actionType) {
                            case 'add':
                                resolve({
                                    ...oldState,
                                    number: oldState.number + 2
                                })
                                break;
                            case 'subtract':
                                resolve({
                                    ...oldState,
                                    number: oldState.number - 1
                                });
                                break;
                            default:
                                resolve(oldState)
                                break;
                        }
                    }, delay)
            ),
            store = getStore(reducer, { number: 0 }),
            t0 = performance.now();

        await store.dispatch({type: 'add'})
        await store.dispatch({type: 'subtract'}, true)
        expect(typeof getStore).toBe('function');
        t1 = performance.now();
        expect(t1-t0 > 2*delay).toBe(true);
    });

    it('default values', async () => {
        const { getStore } = PANGjs,
            store = getStore();
        await store.dispatch({ type: 'whatever' });
        expect(store.getState()).toMatchObject({});
    });

    it('resets as expected', async () => {
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
            store = getStore(red, {n:0});
        await store.dispatch({
            type: 'add',
            payload: { n: 2 }
        }, true)
        expect(store.getState()).toMatchObject({ n: 2 });
        store.reset()
        expect(store.getState()).toMatchObject({ n: 0 }); 
    });

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

        await store.dispatch({
            type: 'add',
            payload: { n: 5 }
        }, true)
        
        expect(store.getState()).toMatchObject({ n: 5 });
        
        store.replaceReducer(red2)
        await store.dispatch({
            type: 'sub',
            payload: { n: 2 }
        },true)    
        expect(store.getState()).toMatchObject({ n: 3 }); 
    });

    it('subscribers are working as expected', done => {
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
            store = getStore(red, {n:0});
        store.subscribe(newState => {
            if (newState.n === 5) done()
        });
        store.dispatch({
            type: 'add',
            payload: { n: 2 }
        }).then(() => {

            store.dispatch({
                type: 'add',
                payload: { n: 3 }
            })
        }).then(() => {
            store.push();
        });
    });
});