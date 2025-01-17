
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
});