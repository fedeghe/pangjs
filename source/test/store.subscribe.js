
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
        await store.stage({ type: 'add', payload: {n : 2} })
            .then((o) => store.stage({ type: 'aaa' }))
            .then((o) => store.stage({ type: 'bbb' }))
            .then((o) => store.dispatch());
        unsubscriber();
        await store.stage({type: 'add'}, { payload: 42 }).then(
            () => {
                expect(count).toBe(0);
            }
        );
        

    }); 
});