const PANGjs = require('../dist');

/*
[Malta] ./init.js
*/

describe(`PANGjs - init`, () => {
    it('getStore is a function', () => {
        const { getStore } = PANGjs;
        expect(typeof getStore).toBe('function');

    });
    it('store initialization with PANGjs.getStore', () => {
        const { getStore } = PANGjs,
            red = () => Promise.resolve({}),
            init = {},
            conf = {},
            store = getStore(red),
            storeInitialized = getStore(red, init, conf);

        expect(PANGjs.isStore(store)).toBeTruthy();
        expect(typeof store.getState).toBe('function');
        expect(typeof store.commit).toBe('function');
        expect(store.reducer).toBe(red);
        expect(store.initState).toMatchObject({});
        expect(store.config).toMatchObject({});
        expect(store.subscribers).toMatchObject([]);

        expect(storeInitialized.initState).toMatchObject(init);
        expect(storeInitialized.config).toMatchObject(conf);
        expect(storeInitialized.subscribers).toMatchObject([]);
    });
    it('default values', async () => {
        const { getStore } = PANGjs,
            store = getStore();
        await store.commit({ type: 'whatever' });
        expect(store.getState()).toMatchObject({});
    });
});
;

/*
[Malta] ./store.commitAutopush.js
*/

describe('PANGjs - store.commit autopush', () => {
    it('works as expected', async () => {
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
        await store.commit({
            type: 'add',
            payload: { n: 2 }
        }, true)
        await store.commit({
                type: 'add',
                payload: { n: 3 }
        }, true)
        const s = store.getState();
        expect(s.n).toBe(5)
    });
});;
/*
[Malta] ./store.uncommit.js
*/

describe('PANGjs - store.uncommit', () => {
    it('works as expected', async () => {
        const { getStore } = PANGjs,
            red = (o, a, p) => {
                if (a === 'add'){
                    return Promise.resolve({
                        n: o.n + p.n
                    })
                }
                return Promise.resolve(o);
            },
            init = { n: 69 },
            conf = {maxElements: 5},
            store = getStore(red, init, conf);
        // commit & push`
        await store.commit({ type: 'add', payload: {n : 2} }, true)
        expect(store.getState()).toMatchObject({ n: 71 });
        // just commit
        await store.commit({ type: 'add', payload: {n : 3} });
        expect(store.getState()).toMatchObject({ n: 71 });
        expect(store.getState(true)).toMatchObject({ n: 74 });
        store.uncommit();
        expect(store.getState()).toMatchObject({ n: 71 });
        expect(store.getState(true)).toMatchObject({ n: 71 });
    });
    it('works as in case of no history, it is neutral', async () => {
        const { getStore } = PANGjs,
            red = (o, a, p) => {
                if (a === 'add'){
                    return Promise.resolve({
                        n: o.n + p.n
                    })
                }
                return Promise.resolve(o);
            },
            init = { n: 69 },
            conf = {},
            store = getStore(red, init, conf);
        // commit & push`
        await store.commit({ type: 'add', payload: {n : 2} }, true)
        expect(store.getState()).toMatchObject({ n: 71 });
        // just commit
        await store.commit({ type: 'add', payload: {n : 3} });
        expect(store.getState()).toMatchObject({ n: 71 });
        expect(store.getState(true)).toMatchObject({ n: 74 });
        store.uncommit();
        expect(store.getState()).toMatchObject({ n: 71 });
        expect(store.getState(true)).toMatchObject({ n: 74 });
    });

});;
/*
[Malta] ./store.combine.js
*/

describe('PANGjs - store.combine', () => {
    const delay = 1e3,
        { combine, getStore } = PANGjs,
        reducer1 = (
            oldState,
            actionType,
            { num }
        ) => new Promise(
            resolve => setTimeout(
                () =>  resolve(
                    actionType === 'add'
                    ? {
                        ...oldState,
                        number: oldState.number + num
                    }
                    : oldState
                ),
                delay
            )
        ),
        reducer2 = (
            oldState,
            actionType,
            { num }
        ) =>  new Promise(
            resolve => setTimeout(
                () =>  resolve(
                    actionType === 'subtract'
                    ? {
                        ...oldState,
                        number: oldState.number - num
                    }
                    : oldState
                ),
                delay
            )
        ),
        combined = combine([reducer1, reducer2]);
    it('works as expected', async () => {
        const store = getStore(combined, { number: 0 });
        
        await store.commit({
            type: 'add',
            payload: { num: 7 }
        })
        
        await store.commit({
            type: 'subtract',
            payload: { num: 2 }
        })
        store.push();
        const r = store.getState()
        expect(r.number).toBe(5)
    });
    it('init defaults to {}', async () => {
        const store = getStore(combined),
            r = store.getState();
        expect(r).toMatchObject({});
    });
});;
/*
[Malta] ./store.move.js
*/

describe('PANGjs - store.move', () => {
    it('works as expected', async () => {
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
            store = getStore(
                red,
                { n: 0 },
                { maxElements: 3 }
            );
        await store.commit({
            type: 'add',
            payload: { n: 2 }
        })
        
        await store.commit({
            type: 'add',
            payload: { n: 3 }
        }, true);

        expect(store.HistoryManager.states.length).toBe(3);
        store.move(-2);
        expect(store.HistoryManager.states.length).toBe(3);
        expect(store.getState()).toMatchObject({ n: 0 });
        store.move(1);
        expect(store.getState()).toMatchObject({ n: 2 });
        await store.commit({
            type: 'add',
            payload: { n: 9 }
        }, true);
        expect(store.getState()).toMatchObject({ n: 11 });
        expect(store.HistoryManager.states.length).toBe(3);
    });
    
    it('prevent to move when unpushed', async () => {
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
            store = getStore(red, { n: 0 }, {maxElements:10});
        await store.commit({
            type: 'add',
            payload: { n: 2 }
        });
        // this is too early, nothing happenz
        store.move(-2);
        expect(store.HistoryManager.states.length).toBe(1);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        expect(store.getState()).toMatchObject({ n: 0 });

        store.push();
        expect(store.HistoryManager.states.length).toBe(2);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        expect(store.getState()).toMatchObject({ n: 2 });
        await store.commit({
            type: 'add',
            payload: { n: 9 }
        }, true);
        expect(store.getState()).toMatchObject({ n: 11 });
        expect(store.HistoryManager.states.length).toBe(3);

        // now should do it
        store.move(-1);
        expect(store.getState()).toMatchObject({ n: 2 });
    });

    it('wont move too far ahead', async () => {
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
            store = getStore(red, { n: 0 }, {maxElements:10});
        await store.commit({
            type: 'add',
            payload: { n: 2 }
        });
        // this is too early, nothing happenz
        store.move(1);
        expect(store.HistoryManager.states.length).toBe(1);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        store.push();
        // no changes, nothing ahead
        expect(store.HistoryManager.states.length).toBe(2);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        store.move(1);
        expect(store.HistoryManager.states.length).toBe(2);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        expect(store.getState()).toMatchObject({ n: 2 });
    });

    it('wont move too far forward', async () => {
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
            store = getStore(red, { n: 0 }, {maxElements:10});
        await store.commit({
            type: 'add',
            payload: { n: 2 }
        });
        // this is too early, nothing happenz
        store.move(-3);
        expect(store.HistoryManager.states.length).toBe(1);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        store.push();
        // no changes, nothing ahead
        expect(store.HistoryManager.states.length).toBe(2);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        store.move(-3);
        expect(store.HistoryManager.states.length).toBe(2);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        expect(store.getState()).toMatchObject({ n: 2 });
    });
    
});;
/*
[Malta] ./store.reset.js
*/

describe('PANGjs - store.reset', () => {

    it('works as expected', async () => {
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
            store = getStore(red, { n: 0 }, { maxElements: 2 });
        await store.commit({
            type: 'add',
            payload: { n: 2 }
        }, true)
        expect(store.getState()).toMatchObject({ n: 2 });
        store.reset()
        expect(store.getState()).toMatchObject({ n: 0 }); 
    });
});;
/*
[Malta] ./store.replaceReducer.js
*/

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

        await store.commit({
            type: 'add',
            payload: { n: 5 }
        }, true)
        
        expect(store.getState()).toMatchObject({ n: 5 });
        
        store.replaceReducer(red2)
        await store.commit({
            type: 'sub',
            payload: { n: 2 }
        },true)    
        expect(store.getState()).toMatchObject({ n: 3 }); 
    });

});;
/*
[Malta] ./store.subscribe.js
*/

describe('PANGjs - store.subscribe', () => {

    it('subscription/unsubscription works as expected', async () => {
        let count = 1;
        const doDone = () => {
            count--;
        }
        const { getStore } = PANGjs,
            red = (o, a, p) => {
                if (a === 'add'){
                    return Promise.resolve({
                        n: o.n + p.n
                    })
                }
                return Promise.resolve(o);
            },
            init = { n: 69 },
            conf = {},
            store = getStore(red, init, conf);
        
        const unsubscriber = store.subscribe(() => doDone());
        await store.commit({ type: 'add', payload: {n : 2} })
            .then((o) => store.commit({ type: 'aaa' }))
            .then((o) => store.commit({ type: 'bbb' }))
            .then((o) => store.push());
        unsubscriber();
        await store.commit({type: 'add'}, { payload: 42 }).then(
            () => {
                expect(count).toBe(0);
            }
        );
        

    }); 
});;
/*
[Malta] ./asyncStore.js
*/

describe('PANGjs - async store', () => {
    it('works asynchronously as expected - promise/timeOut', async () => {
        const { getStore } = PANGjs,
            red = async (oldState, actionType, payload) => {
                const doRet = () => 
                    new Promise(resolve => {
                        setTimeout(
                            () => resolve({
                                ...oldState,
                                n: oldState.n + (payload.n || 1)
                            }),
                            1000
                        )
                    });
                if (actionType === 'add') {
                    return await doRet()
                }
                return Promise.resolve(oldState)
            },
            store = getStore(red, {n:0}, {maxElements:5});
        await store.commit({
            type: 'add',
            payload: { n: 2 }
        }, true)
        expect(store.getState()).toMatchObject({ n: 2 });
        store.reset()
        expect(store.getState()).toMatchObject({ n: 0 }); 
    });
    it('works asynchronously as expected - fetch', async () => {
        const { getStore } = PANGjs,
            red = async (oldState, actionType, payload) => {
                // the will fails, but still we explit the httpstatus code ;) 
                const url = "https://example.org/products.json";
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        return {
                            ...oldState,
                            n: oldState.n + parseInt(response.status, 10)
                        }
                    }
  
                } catch (error) {
                    return oldState
                }
            },
            store = getStore(red, {n:0}, {maxElements:5});
        await store.commit({
            type: 'add',
            payload: { n: 2 }
        }, true)
        expect(store.getState()).toMatchObject({ n: 404 });
        store.reset()
        expect(store.getState()).toMatchObject({ n: 0 }); 
    });

});;
/*
[Malta] ./storeHistory.js
*/

describe('PANGjs - store historyManager', () => {
    it('works as expected', async () => {
        const { getStore } = PANGjs,
            red = (oldState, actionType, payload) => {
                if(actionType==='mult'){
                    return Promise.resolve({
                        ...oldState,
                        n: oldState.n * (payload.n || 1)
                    })
                }
                return Promise.resolve(oldState)
            },
            store = getStore(red, {n:2}, {
                maxElements: 3
            });
        await store.commit({ type: 'mult', payload: { n: 3 }}); // => 6
        await store.commit({ type: 'mult', payload: { n: 5 }}); // => 30
        await store.commit({ type: 'mult', payload: { n: 7 }}); // => 210
        await store.commit({ type: 'mult', payload: { n: 11 }}, true); // => 2310
        
        expect(store.HistoryManager.states.length).toBe(3);
        expect(store.getState()).toMatchObject({ n: 2310 });
        await store.commit({ type: 'mult', payload: { n: 0.5 }}, true);
        expect(store.getState()).toMatchObject({ n: 1155 });
        expect(store.HistoryManager.states.length).toBe(3);

    });
});;
/*
[Malta] ./exceptions.js
*/

describe('PANGjs throw all expected exceptions', () => {
    beforeAll(() => {
        jest.clearAllMocks();
    })
    it('action not given', done => {
        const { getStore } = PANGjs,
            red = () => Promise.resolve({}),
            store = getStore(red);
        store.commit({}).catch(e => {
            expect(e.message).toBe('[ERROR] Actions needs a type!')
            done()
        })
    });
    
    it('action not found', done => {
        const { getStore } = PANGjs,
            red = (oldS, type) => ['ADD', 'SUB'].includes(type)
                    ? Promise.resolve({})
                    : Promise.reject('no action found'),
            store = getStore(red);
        
        store.commit({type:'MULT'}).catch(e => {
            expect(e).toBe('no action found')
            done()
        })
    });
    it('reducer does not return a promise', () => {
        const { getStore } = PANGjs,
            red = (oldState, type) => ['ADD', 'SUB'].includes(type),
            store = getStore(red);

            expect(() => {
                store.commit({type:'MULT'})
            }).toThrow('[ERROR] Reducer should return a promise!')
    });
    it('reducer must be a function', () => {
        const { getStore } = PANGjs,
            red = {};
            
            expect(() => {
                getStore(red);
            }).toThrow('[ERROR] Reducer must be a function!')
    });

    it('move param must be a number', () => {
        const { getStore } = PANGjs,
            red = getStore(() =>Promise.resolve({}), {}, {maxElements:5});
            
            expect(() => {
                red.move('a');
            }).toThrow('[ERROR] Move requires a number!')
    });
    it('unauth transition', done => {
        const { getStore } = PANGjs,
            store = getStore(() => Promise.resolve({}), {}, {
                check: () => false
            });

            store.commit({type:'whatever'}).catch(e => {
                expect(e.message).toBe('[ERROR] State transition not allowed!')
                done()
            })
    });
});;