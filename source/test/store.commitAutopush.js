
describe('PANGjs - store.stage autoDispatch', () => {
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
        await store.stage({
            type: 'add',
            payload: { n: 2 }
        }, true)
        await store.stage({
                type: 'add',
                payload: { n: 3 }
        }, true)
        const s = store.getState();
        expect(s.n).toBe(5)
    });
});