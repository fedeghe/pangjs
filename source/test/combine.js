
describe('PANGjs - combine', () => {
    it('two reducers', async () => {
        const delay = 1e3,
            { combine, getStore } = PANGjs,
            reducer1 = (
                oldState,
                actionType,
                { num }
            ) => new Promise(
                resolve => setTimeout(
                    () =>  resolve(
                        actionType === 'add'
                        ? {
                            ...oldState,
                            number: oldState.number + num
                        }
                        : oldState
                    ),
                    delay
                )
            ),
            reducer2 = (
                oldState,
                actionType,
                { num }
            ) =>  new Promise(
                resolve => setTimeout(
                    () =>  resolve(
                        actionType === 'subtract'
                        ? {
                            ...oldState,
                            number: oldState.number - num
                        }
                        : oldState
                    ),
                    delay
                )
            ),
            combined = combine([reducer1, reducer2]),
            store = getStore(combined, { number: 0 }),
            t0 = performance.now();
        
        await store.dispatch({
            type: 'add',
            payload: { num: 7 }
        })
        
        await store.dispatch({
            type: 'subtract',
            payload: { num: 2 }
        })
        store.push();
        const r = store.getState()
        expect(r.number).toBe(5)
    });
});