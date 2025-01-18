
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
        await store.stage({ type: 'add', payload: {n : 2} }, true)
        expect(store.getState()).toMatchObject({ n: 71 });
        // just stage
        await store.stage({ type: 'add', payload: {n : 3} });
        expect(store.getState()).toMatchObject({ n: 71 });
        expect(store.getState(true)).toMatchObject({ n: 74 });
        store.unstage();
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
        // stage & dipatch`
        await store.stage({ type: 'add', payload: {n : 2} }, true)
        expect(store.getState()).toMatchObject({ n: 71 });
        // just stage
        await store.stage({ type: 'add', payload: {n : 3} });
        expect(store.getState()).toMatchObject({ n: 71 });
        expect(store.getState(true)).toMatchObject({ n: 74 });
        store.unstage();
        expect(store.getState()).toMatchObject({ n: 71 });
        expect(store.getState(true)).toMatchObject({ n: 74 });
    });

});