
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

});