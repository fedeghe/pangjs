'use strict';
/*
PANGjs
v. 1.0.0
10:7:49
Size: ~5.97KB
*/
var PANGjs = (function () {
    'use strict';

    /*
    [Malta] errors.js
    */
    /* eslint-disable no-unused-vars */
    var ERRORS = {
        REDUCERS_FUNCTION: '[ERROR] Reducer must be a function!',
        REDUCERS_RETURN: '[ERROR] Reducer should return something!',
        SUBSCRIBERS_FUNCTION: '[ERROR] Subscribers must be a functions!',
        ACTION_TYPE: '[ERROR] Actions needs a type',
        UNAUTHORIZED_STATECHANGE: '[ERROR] State transition not allowed'
    };
    
    /*
    [Malta] utils.js
    */
    /* eslint-disable no-unused-vars */
    function _isFunction (o, msg) {
        if (typeof o !== 'function') { throw new Error(msg); }
    }
    
    // function _isDefined (o, msg) {
    //     if (typeof o === 'undefined') { throw new Error(msg); }
    // }
    
    /*
    [Malta] HistoryManager.js
    */
    function HistoryManager (initState, config) {
        this.states = [initState || {}];
        this.unpushedStates = [initState || {}];
        this.config = config || {};
        this.maxElements = this.config.maxElements || false;
        this.index = 0;
        this.unpushedIndex = 0;
    }
    
    HistoryManager.prototype.top = function (unpushed) {
        return this[unpushed ? 'unpushedStates' : 'states'][
            this[unpushed ? 'unpushedIndex': 'index']
        ];
    }
    
    HistoryManager.prototype.commit = function(state, autoPush) {
        var newStates = this.unpushedStates.slice(
            0,
            this.unpushedIndex + 1
        );
        newStates.push(state);
        
        if (this.maxElements && newStates.length > this.maxElements) {
            newStates.shift();
        } else {
            this.unpushedIndex++;
        }
        this.unpushedStates = newStates;
        if (autoPush) this.push();
        return this;
    }
    
    
    HistoryManager.prototype.push = function () {
        this.states = this.unpushedStates;
        this.index = this.unpushedIndex;
    }
    
    HistoryManager.prototype.reset = function () {
        this.index = 0;
        this.states = this.states.slice(0, 1);
        this.unpushedIndex = 0;
        this.unpushedStates = this.unpushedStates.slice(0, 1);
    }
    /*
    [Malta] store.js
    */
    var defaultReducer = function(){
        return Promise.resolve({})
    };
    
    function Store(reducer, initState, config) {
        this.reducer = reducer || defaultReducer;
        this.initState = initState || {};
        this.config = config || {};
        this.subscribers = [];
        this.HistoryManager = new HistoryManager(
            this.initState,
            this.config
        );
    };
    
    Store.prototype.getState = function (unpushed) {
        return this.HistoryManager.top(unpushed);
    };
    
    Store.prototype.dispatch = function (action, autoPush) {
        if (!('type' in action)) {
            return Promise.reject(ERRORS.ACTION_TYPE);
        }
        var self = this,
            actionType = action.type,
            payload = action.payload || {},
            currentState = this.getState(true);
            
        return this.reducer(
            currentState,
            actionType,
            payload
        ).then(function (newState){
            self.HistoryManager.commit(newState, autoPush)
            return newState;
        });
    };
    
    Store.prototype.push = function () {
        this.HistoryManager.push();
        var newState = this.HistoryManager.top();
        this.subscribers.forEach(function (subscriber) {
            subscriber(newState);
        });
    };
    
    Store.prototype.subscribe = function (subscriber) {
        _isFunction(subscriber, ERRORS.SUBSCRIBERS_FUNCTION);
        var self = this,
            p;
        this.subscribers.push(subscriber);
        p = this.subscribers.length - 1;
    
        // unsubcriber
        return function () {
            self.subscribers[p] = null;
        };
    };
    
    Store.prototype.move = function (to) {
        if (
            this.HistoryManager.index !== this.HistoryManager.unpushedIndex
            || typeof to === 'undefined'
            || to === 0
        ) return this;
        var tmpIndex = this.HistoryManager.index + to,
            willChange = tmpIndex > -1 && tmpIndex < this.HistoryManager.states.length,
            newIndex = willChange ? tmpIndex : this.currentIndex;
    
        this.HistoryManager.index = newIndex;
        this.HistoryManager.unpushedIndex = newIndex;
        return this;
    };
    
    Store.prototype.replaceReducer = function (reducer) {
        this.reducer = reducer || defaultReducer;
    };
    
    Store.prototype.reset = function () {
        this.HistoryManager.reset();
        this.subscribers = [];
    };

    return {
        ERRORS: ERRORS,
        getStore: function (reducer, initState, config) {
            return new Store(reducer, initState, config);
        },
        isStore: function (s) {
            return s instanceof Store;
        },
        combine: function (reducers) {
            return function (currentState, actionType, payload) {
                currentState = currentState || initState;
                var newState = Object.assign({}, currentState),
                    rlen = reducers.length;

                return new Promise(function (resolve) {
                    
                    return reducers.reduce(function (acc, red, i) {
                        return acc.then(function (r) {
                            // console.log({ r: r, actionType: actionType });
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
