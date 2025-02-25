var PANGjs = (function () {
    'use strict';

    maltaF('errors.js')
    maltaF('utils.js')
    maltaF('HistoryManager.js')
    maltaF('store.js')

    return {
        ERRORS: ERRORS,
        getStore: function (reducer, initState, config) {
            var newStore =  new Store(reducer, initState, config);
            return newStore;
        },
        isStore: function (s) {
            return s instanceof Store;
        },
        combine: function (reducers) {
            reducers.forEach(function (reducer){
                _isFunction(reducer, ERRORS.REDUCERS_FUNCTION);
            })
            return function (currentState, actionType, payload) {
                var newState = Object.assign({}, currentState),
                    rlen = reducers.length;

                return new Promise(function (resolve) {
                    
                    return reducers.reduce(function (acc, red, i) {
                        return acc.then(function (r) {
                            if(rlen - 1 === i){
                                return resolve(
                                    red(r, actionType, payload)
                                );
                            } else{
                                return red(r, actionType, payload);
                            }
                        });
                    }, Promise.resolve(newState));
                });
            };
        }
    };
})();

(typeof exports === 'object') && (module.exports = PANGjs);
