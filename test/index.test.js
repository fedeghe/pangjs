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
});
;
/*
[Malta] ./store.js
*/

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

        await store.commit({type: 'add'})
        await store.commit({type: 'subtract'}, true)
        expect(typeof getStore).toBe('function');
        t1 = performance.now();
        expect(t1-t0 > 2*delay).toBe(true);
    });

    it('default values', async () => {
        const { getStore } = PANGjs,
            store = getStore();
        await store.commit({ type: 'whatever' });
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
        await store.commit({
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

    it('autopush is working as expected', async () => {
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
    it('move works as expected', async () => {
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
        })
        
        await store.commit({
            type: 'add',
            payload: { n: 3 }
        }, true);
        expect(store.HistoryManager.states.length).toBe(3);
        store.move(-2);
        expect(store.HistoryManager.states.length).toBe(3);
        expect(store.getState()).toMatchObject({ n: 0 });
        await store.commit({
            type: 'add',
            payload: { n: 9 }
        }, true);
        expect(store.getState()).toMatchObject({ n: 9 });
        expect(store.HistoryManager.states.length).toBe(2);

    });
    
    it('uncommit as expected', async () => {
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
        expect(store.getState(true)).toMatchObject({ n: 71 });
    })

    it('store allows subscription', done => {
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
        
        store.subscribe(() => done());
        store.commit({ type: 'add', payload: {n : 2} })
            .then((o) => store.commit({ type: 'aaa' }))
            .then((o) => store.commit({ type: 'bbb' }))
            .then((o) => store.push());
    }); 
});;
/*
[Malta] ./HistoryManager.js
*/
describe('PANGjs - store.historyManager', () => {
    const red = () => Promise.resolve({});
    
    describe('constructor does its job', () => {
        it('works with no params', () => {
            const { getStore } = PANGjs,
                store = getStore(),
                hm = store.HistoryManager;
            expect(hm.states.length).toBe(1);
            expect(hm.config).toMatchObject({});
            expect(hm.maxElements).toBe(false);
            expect(hm.index).toBe(0);
        });
    });

    describe('works as expected in non restricted mode', () => {
        it('stores more states', () => {
            const { getStore } = PANGjs,
                store = getStore(),
                hm = store.HistoryManager;
            s1 = { a:1, b: 2},
            s2 = { a:2, b: 4};
            const ss0 = hm.top();
            expect(ss0).toMatchObject({});
            hm.commit(s1, true);
            const ss1 = hm.top();
            
            expect(ss1).toMatchObject(s1);
            expect(hm.states.length).toBe(2);

            hm.commit(s2, true);
            const ss2 = hm.top();
            expect(ss2).toMatchObject(s2);
            expect(hm.states.length).toBe(3);
        });
        it('resets as expected', () => {
            const { getStore } = PANGjs,
                store = getStore(),
                hm = store.HistoryManager;
            s1 = { a:1, b: 2},
            s2 = { a:2, b: 4};
            expect(hm.top()).toMatchObject({});
            hm.commit(s1);
            hm.commit(s2, true);
            expect(hm.top()).toMatchObject(s2);
            hm.reset();
            expect(hm.top()).toMatchObject({});
        })
    });

    describe('works as expected in restricted mode', () => {
        it('stores restricted history - one', () => {
            const init = {},
                { getStore } = PANGjs,
                store = getStore(red, init, {
                    maxElements: 1
                }),
                hm = store.HistoryManager,
                s1 = { a:1, b: 2},
                s2 = { a:2, b: 4};
            const ss0 = hm.top();
            expect(ss0).toMatchObject(init);
            hm.commit(s1, true);
            const ss1 = hm.top();
            
            expect(ss1).toMatchObject(s1);
            expect(hm.states.length).toBe(1);

            hm.commit(s2).push();
            const ss2 = hm.top();
            expect(ss2).toMatchObject(s2);
            expect(hm.states.length).toBe(1);
        });

        it('stores restricted history - more', () => {
            const init = {},
                { getStore } = PANGjs,
                store = getStore(red, init, {
                    maxElements: 3
                }),
                hm = store.HistoryManager,
                s1 = { a:1, b: 2},
                s2 = { a:2, b: 4},
                s3 = { a:3, b: 5};
            const ss0 = hm.top();
            expect(ss0).toMatchObject(init);
            hm.commit(s1).push();
            const ss1 = hm.top();
            expect(ss1).toMatchObject(s1);
            expect(hm.states.length).toBe(2);

            hm.commit(s2).push();
            const ss2 = hm.top();
            expect(ss2).toMatchObject(s2);
            expect(hm.states.length).toBe(3)
            
            hm.commit(s3).push();
            const ss3 = hm.top();
            expect(ss3).toMatchObject(s3);
            expect(hm.states.length).toBe(3);

            expect(hm.states[0]).toBe(s1);
        });
    });
});;
/*
[Malta] ./exceptions.js
*/

describe('PANGjs throw all expected exceptions', () => {
    it('action not given', done => {
        const { getStore } = PANGjs,
            red = () => Promise.resolve({}),
            store = getStore(red);
        store.commit({}).catch(e => {
            expect(e).toBe('[ERROR] Actions needs a type')
            done()
        })
    });
    
    it('action not found', done => {
        const { getStore } = PANGjs,
            red = ({type}) => ['ADD', 'SUB'].includes(type)
                    ? Promise.resolve({})
                    : Promise.reject('no action found'),
            store = getStore(red);
        store.commit({type:'MULT'}).catch(e => {
            expect(e).toBe('no action found')
            done()
        })
    });
});;
/*
[Malta] ./combine.js
*/

describe('PANGjs - combine', () => {
    it('two reducers', async () => {
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
            combined = combine([reducer1, reducer2]),
            store = getStore(combined, { number: 0 }),
            t0 = performance.now();
        
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
});;