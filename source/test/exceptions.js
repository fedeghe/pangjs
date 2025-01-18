
describe('PANGjs throw all expected exceptions', () => {
    beforeAll(() => {
        jest.clearAllMocks();
    })
    it('action not given', done => {
        const { getStore } = PANGjs,
            red = () => Promise.resolve({}),
            store = getStore(red);
        store.stage({}).catch(e => {
            expect(e.message).toBe('[ERROR] Actions needs a type!')
            done()
        })
    });
    
    it('action not found', done => {
        const { getStore } = PANGjs,
            red = (oldS, type) => ['ADD', 'SUB'].includes(type)
                    ? Promise.resolve({})
                    : Promise.reject('no action found'),
            store = getStore(red);
        
        store.stage({type:'MULT'}).catch(e => {
            expect(e).toBe('no action found')
            done()
        })
    });
    it('reducer does not return a promise', () => {
        const { getStore } = PANGjs,
            red = (oldState, type) => ['ADD', 'SUB'].includes(type),
            store = getStore(red);

            expect(() => {
                store.stage({type:'MULT'})
            }).toThrow('[ERROR] Reducer should return a promise!')
    });
    it('reducer must be a function', () => {
        const { getStore } = PANGjs,
            red = {};
            
            expect(() => {
                getStore(red);
            }).toThrow('[ERROR] Reducer must be a function!')
    });

    it('move param must be a number', () => {
        const { getStore } = PANGjs,
            red = getStore(() =>Promise.resolve({}), {}, {maxElements:5});
            
            expect(() => {
                red.move('a');
            }).toThrow('[ERROR] Move requires a number!')
    });
    it('unauth transition', done => {
        const { getStore } = PANGjs,
            store = getStore(() => Promise.resolve({}), {}, {
                check: () => false
            });

            store.stage({type:'whatever'}).catch(e => {
                expect(e.message).toBe('[ERROR] State transition not allowed!')
                done()
            })
    });
});