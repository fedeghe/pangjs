
describe('PANGjs throw all expected exceptions', () => {
    it('action not given', done => {
        const { getStore } = PANGjs,
            red = () => Promise.resolve({}),
            store = getStore(red);
        store.commit({}).catch(e => {
            expect(e).toBe('[ERROR] Actions needs a type')
            done()
        })
    });
    
    it('action not found', done => {
        const { getStore } = PANGjs,
            red = (oldS, type) => ['ADD', 'SUB'].includes(type)
                    ? Promise.resolve({})
                    : Promise.reject('no action found'),
            store = getStore(red);
        
        store.commit({type:'MULT'}).catch(e => {
            expect(e).toBe('no action found')
            done()
        })
    });
    it('reducer does not return a promise', () => {
        const { getStore } = PANGjs,
            red = (oldState, type) => ['ADD', 'SUB'].includes(type),
            store = getStore(red);

            expect(() => {
                store.commit({type:'MULT'})
            }).toThrow('[ERROR] Reducer should return a promise!')
    });
});