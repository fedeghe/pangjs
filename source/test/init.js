
describe(`PANGjs - init`, () => {
    it('getStore is a function', () => {
        const { getStore } = PANGjs;
        expect(typeof getStore).toBe('function');

    });
    it('store initialization with PANGjs.getStore', () => {
        const { getStore } = PANGjs,
            red = () => Promise.resolve({}),
            init = {},
            conf = {},
            store = getStore(red),
            storeInitialized = getStore(red, init, conf);

        expect(PANGjs.isStore(store)).toBeTruthy();
        expect(typeof store.getState).toBe('function');
        expect(typeof store.commit).toBe('function');
        expect(store.reducer).toBe(red);
        expect(store.initState).toMatchObject({});
        expect(store.config).toMatchObject({});
        expect(store.subscribers).toMatchObject([]);

        expect(storeInitialized.initState).toMatchObject(init);
        expect(storeInitialized.config).toMatchObject(conf);
        expect(storeInitialized.subscribers).toMatchObject([]);
    });
    it('default values', async () => {
        const { getStore } = PANGjs,
            store = getStore();
        await store.commit({ type: 'whatever' });
        expect(store.getState()).toMatchObject({});
    });
});
