
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
        await store.stage({
            type: 'add',
            payload: { n: 2 }
        }, true)
        expect(store.getState()).toMatchObject({ n: 2 });
        store.reset()
        expect(store.getState()).toMatchObject({ n: 0 }); 
        await store.dispatch({
            type: 'add',
            payload: { n: 3 }
        })
        expect(store.getState()).toMatchObject({ n: 3 }); 
    });
    it('reset triggers subscribers', done => {
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
            store = getStore(red, { n: 0 });
        
        store.dispatch({
            type: 'add',
            payload: { n: 2 }
        }).then(() => {
            expect(store.getState()).toMatchObject({ n: 2 });
        }).then(() => {  
            store.subscribe(s => {
                expect(s).toMatchObject({ n: 0 });
                done();
            });
            
            store.reset();
        })
        
    });
});