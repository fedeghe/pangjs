
describe('PANGjs - store.combine', () => {
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
        combined = combine([reducer1, reducer2]);

    it('works as expected', async () => {
        const store = getStore(combined, { number: 0 });
        
        await store.stage({
            type: 'add',
            payload: { num: 7 }
        })
        
        await store.stage({
            type: 'subtract',
            payload: { num: 2 }
        })
        store.dispatch();
        const r = store.getState()
        expect(r.number).toBe(5)
    });
    it('init defaults to {}', async () => {
        const store = getStore(combined),
            r = store.getState();
        expect(r).toMatchObject({});
    });
});