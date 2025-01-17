
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
});