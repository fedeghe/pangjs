
describe('PANGjs - store.push', () => {
    it('commit then push', async () => {
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
    it('straigth push', async () => {
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
        },)
        const s = store.getState();
        expect(s.n).toBe(2)
    });
});