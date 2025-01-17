
describe('PANGjs - store.move', () => {
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
            store = getStore(
                red,
                { n: 0 },
                { maxElements: 3 }
            );
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
        store.move(1);
        expect(store.getState()).toMatchObject({ n: 2 });
        await store.commit({
            type: 'add',
            payload: { n: 9 }
        }, true);
        expect(store.getState()).toMatchObject({ n: 11 });
        expect(store.HistoryManager.states.length).toBe(3);
    });
    
    it('prevent to move when unpushed', async () => {
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
            store = getStore(red, { n: 0 }, {maxElements:10});
        await store.commit({
            type: 'add',
            payload: { n: 2 }
        });
        // this is too early, nothing happenz
        store.move(-2);
        expect(store.HistoryManager.states.length).toBe(1);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        expect(store.getState()).toMatchObject({ n: 0 });

        store.push();
        expect(store.HistoryManager.states.length).toBe(2);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        expect(store.getState()).toMatchObject({ n: 2 });
        await store.commit({
            type: 'add',
            payload: { n: 9 }
        }, true);
        expect(store.getState()).toMatchObject({ n: 11 });
        expect(store.HistoryManager.states.length).toBe(3);

        // now should do it
        store.move(-1);
        expect(store.getState()).toMatchObject({ n: 2 });
    });

    it('wont move too far ahead', async () => {
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
            store = getStore(red, { n: 0 }, {maxElements:10});
        await store.commit({
            type: 'add',
            payload: { n: 2 }
        });
        // this is too early, nothing happenz
        store.move(1);
        expect(store.HistoryManager.states.length).toBe(1);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        store.push();
        // no changes, nothing ahead
        expect(store.HistoryManager.states.length).toBe(2);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        store.move(1);
        expect(store.HistoryManager.states.length).toBe(2);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        expect(store.getState()).toMatchObject({ n: 2 });
    });

    it('wont move too far forward', async () => {
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
            store = getStore(red, { n: 0 }, {maxElements:10});
        await store.commit({
            type: 'add',
            payload: { n: 2 }
        });
        // this is too early, nothing happenz
        store.move(-3);
        expect(store.HistoryManager.states.length).toBe(1);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        store.push();
        // no changes, nothing ahead
        expect(store.HistoryManager.states.length).toBe(2);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        store.move(-3);
        expect(store.HistoryManager.states.length).toBe(2);
        expect(store.HistoryManager.unpushedStates.length).toBe(2);
        expect(store.getState()).toMatchObject({ n: 2 });
    });
    
});