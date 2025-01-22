
describe('PANGjs - store.dispatch', () => {
    it('stage then dispatch', async () => {
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
        await store.stage({
            type: 'add',
            payload: { n: 2 }
        },)
        await store.dispatch()
        const s = store.getState();
        expect(s.n).toBe(2)
    });
    it('straigth dispatch', async () => {
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
        })
        const s = store.getState();
        expect(s.n).toBe(2)
    });
    it('stage dispatch, stage dispatch, no history', async () => {
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
        await store.stage({
            type: 'add',
            payload: { n: 2 }
        })
        await store.dispatch()
        await store.stage({
            type: 'add',
            payload: { n: 2 }
        })
        await store.dispatch()
        await store.dispatch()
        const s = store.getState();
        expect(s.n).toBe(4)
        await store.stage({
            type: 'add',
            payload: { n: 2 }
        },true)
        const s2 = store.getState();
        expect(s2.n).toBe(6)
        store.reset();
        const s3 = store.getState();
        expect(s3.n).toBe(0)
    });
    it('stage dispatch, stage dispatch, with history', async () => {
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
            store = getStore(red, {n:0}, {maxElements:100});
        await store.stage({
            type: 'add',
            payload: { n: 2 }
        })
        await store.dispatch()
        await store.stage({
            type: 'add',
            payload: { n: 2 }
        })
        await store.dispatch()
        await store.dispatch()
        const s = store.getState();
        expect(s.n).toBe(4)
        await store.stage({
            type: 'add',
            payload: { n: 2 }
        },true)
        const s2 = store.getState();
        expect(s2.n).toBe(6)
        store.reset();
        const s3 = store.getState();
        expect(s3.n).toBe(0)
    });
});