describe('PANGjs - store.historyManager', () => {
    const red = () => Promise.resolve({});
    
    describe('constructor does its job', () => {
        it('works with no params', () => {
            const { getStore } = PANGjs,
                store = getStore(),
                hm = store.HistoryManager;
            expect(hm.states.length).toBe(1);
            expect(hm.config).toMatchObject({});
            expect(hm.maxElements).toBe(false);
            expect(hm.index).toBe(0);
        });
    });

    describe('works as expected in non restricted mode', () => {
        it('stores more states', () => {
            const { getStore } = PANGjs,
                store = getStore(),
                hm = store.HistoryManager;
            s1 = { a:1, b: 2},
            s2 = { a:2, b: 4};
            const ss0 = hm.top();
            expect(ss0).toMatchObject({});
            hm.commit(s1, true);
            const ss1 = hm.top();
            
            expect(ss1).toMatchObject(s1);
            expect(hm.states.length).toBe(2);

            hm.commit(s2, true);
            const ss2 = hm.top();
            expect(ss2).toMatchObject(s2);
            expect(hm.states.length).toBe(3);
        });
        it('resets as expected', () => {
            const { getStore } = PANGjs,
                store = getStore(),
                hm = store.HistoryManager;
            s1 = { a:1, b: 2},
            s2 = { a:2, b: 4};
            expect(hm.top()).toMatchObject({});
            hm.commit(s1);
            hm.commit(s2, true);
            expect(hm.top()).toMatchObject(s2);
            hm.reset();
            expect(hm.top()).toMatchObject({});
        })
    });

    describe('works as expected in restricted mode', () => {
        it('stores restricted history - one', () => {
            const init = {},
                { getStore } = PANGjs,
                store = getStore(red, init, {
                    maxElements: 1
                }),
                hm = store.HistoryManager,
                s1 = { a:1, b: 2},
                s2 = { a:2, b: 4};
            const ss0 = hm.top();
            expect(ss0).toMatchObject(init);
            hm.commit(s1, true);
            const ss1 = hm.top();
            
            expect(ss1).toMatchObject(s1);
            expect(hm.states.length).toBe(1);

            hm.commit(s2).push();
            const ss2 = hm.top();
            expect(ss2).toMatchObject(s2);
            expect(hm.states.length).toBe(1);
        });

        it('stores restricted history - more', () => {
            const init = {},
                { getStore } = PANGjs,
                store = getStore(red, init, {
                    maxElements: 3
                }),
                hm = store.HistoryManager,
                s1 = { a:1, b: 2},
                s2 = { a:2, b: 4},
                s3 = { a:3, b: 5};
// console.log({hm});
            const ss0 = hm.top();
            expect(ss0).toMatchObject(init);
            hm.commit(s1).push();
            const ss1 = hm.top();
            expect(ss1).toMatchObject(s1);
            expect(hm.states.length).toBe(2);

            hm.commit(s2).push();
            const ss2 = hm.top();
            expect(ss2).toMatchObject(s2);
            expect(hm.states.length).toBe(3)
            
            hm.commit(s3).push();
            const ss3 = hm.top();
            expect(ss3).toMatchObject(s3);
            expect(hm.states.length).toBe(3);

            expect(hm.states[0]).toBe(s1);
        });
    });
});