
describe('PANGjs - store', () => {
    it('store chain of commits and push works as expected', async () => {
        const delay = 1e3,
            { getStore } = PANGjs,
            reducer = (
                oldState,
                actionType,
                payload
            ) => new Promise(
                resolve => 
                    setTimeout(() => {
                        switch(actionType) {
                            case 'add':
                                resolve({
                                    ...oldState,
                                    number: oldState.number + 2
                                })
                                break;
                            case 'subtract':
                                resolve({
                                    ...oldState,
                                    number: oldState.number - 1
                                });
                                break;
                            default:
                                resolve(oldState)
                                break;
                        }
                    }, delay)
            ),
            store = getStore(reducer, { number: 0 }),
            t0 = performance.now();

        await store.commit({type: 'add'})
        await store.commit({type: 'subtract'}, true)
        expect(typeof getStore).toBe('function');
        t1 = performance.now();
        expect(t1-t0 > 2*delay).toBe(true);
    });
});