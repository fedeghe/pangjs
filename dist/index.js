'use strict';
/*
PANGjs
v. 0.0.4

Size: ~8.08KB
*/
var PANGjs = (function () {
    'use strict';

    /*
    [Malta] errors.js
    */
    /* eslint-disable no-unused-vars */
    var ERRORS = {
        REDUCERS_FUNCTION: '[ERROR] Reducer must be a function!',
        REDUCERS_RETURN: '[ERROR] Reducer should return a promise!',
        REDUCERS_ASYNC: '[ERROR] Reducer should be asynchronous!',
        SUBSCRIBERS_FUNCTION: '[ERROR] Subscribers must be a functions!',
        ACTION_TYPE: '[ERROR] Actions needs a type!',
        UNAUTHORIZED_STATECHANGE: '[ERROR] State transition not allowed!',
        MOVE_TO_NUMBER: '[ERROR] Move requires a number!'
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
    
    // function _isAsync(fn, msg) {
    //     if (
    //         fn.constructor.name !== "AsyncFunction"
    //         && !('then' in fn())
    //     ){ throw new Error(msg); };
    // }
    
    function _isPromise(p, msg) {
        if (p.constructor.name !== 'Promise'){ throw new Error(msg); };
    }
    
    function _isNumber(n, msg) {
        if (typeof n !== 'number') { throw new Error(msg); }
    }
    /*
    [Malta] HistoryManager.js
    */
    function HistoryManager (initState, config) {
        this.initState = initState;
        this.states = [initState];
        this.stagedStates = [initState];
        this.config = config;
        this.maxElements = Math.max(
            1,
            parseInt(this.config.maxElements, 10)
        ) || 1;
        this.index = 0;
        this.stagedIndex = 0;
    }
    
    HistoryManager.prototype.top = function (staged) {
        return this[staged ? 'stagedStates' : 'states'][
            this[staged ? 'stagedIndex': 'index']
        ];
    };
    
    HistoryManager.prototype.stage = function(state, autoDispatch) {
        var newStates = this.stagedStates.slice(
            0,
            this.stagedIndex + 1
        );
        newStates.push(state);
        
        if (this.maxElements && newStates.length > this.maxElements) {
            newStates.shift();
        } else {
            this.stagedIndex++;
        }
        this.stagedStates = newStates;
        if (autoDispatch) this.sync();
        return this;
    };
    
    HistoryManager.prototype.sync = function () {
        this.states = this.stagedStates;
        this.index = this.stagedIndex;
    };
    
    HistoryManager.prototype.reset = function () {
        this.index = 0;
        this.states = [this.initState];
        this.stagedIndex = 0;
        this.stagedStates = this.stagedStates.slice(0, 1);
    };
    /*
    [Malta] store.js
    */
    var defaultReducer = function(){
        return Promise.resolve({})
    };
    
    function Store(reducer, initState, config) {
        this.reducer = reducer || defaultReducer;
        _isFunction(this.reducer, ERRORS.REDUCERS_FUNCTION);
        // _isAsync(this.reducer, ERRORS.REDUCERS_ASYNC);
        this.initState = initState || {};
        this.config = config || {};
        this.config.check = this.config.check || function (){return true};
        _isFunction(this.config.check, ERRORS.REDUCERS_FUNCTION);
        this.subscribers = [];
        this.previousAction = 'ORIGIN';
        this.HistoryManager = new HistoryManager(
            this.initState,
            this.config
        );
    };
    
    Store.prototype.getState = function (staged) {
        return this.HistoryManager.top(staged);
    };
    
    Store.prototype.unstage = function () {
        if (this.HistoryManager.maxElements === 1) {
            return this;
        }
        this.HistoryManager.stagedIndex = this.HistoryManager.index;
        this.HistoryManager.stagedStates =  this.HistoryManager.states;
    };
    
    Store.prototype.stage = function (action, autoDispatch) {
        if (!('type' in action)) {
            return Promise.reject(new Error(ERRORS.ACTION_TYPE));
        }
        var self = this,
            actionType = action.type,
            payload = action.payload || {},
            currentState = this.getState(true);
        if (!self.config.check(
            currentState,
            self.previousAction,
            actionType,
            payload
        )) {
            return Promise.reject(new Error(ERRORS.UNAUTHORIZED_STATECHANGE));
        }
        var ret = this.reducer(
            currentState,
            actionType,
            payload
        );
        _isPromise(ret, ERRORS.REDUCERS_RETURN);
        this.previousAction = actionType;
        return ret.then(function (newState){
            self.HistoryManager.stage(newState, autoDispatch);
            if(autoDispatch) self.emit(newState);
            return newState;
        });
    };
    
    Store.prototype.emit = function (newState) {
        this.subscribers.filter(function(filter) {
            return Boolean(filter);
        }).forEach(function (subscriber) {
            subscriber(newState);
        });
    };
    
    Store.prototype.dispatch = function (action) {
        if(action) return this.stage(action, true);
        this.HistoryManager.sync();
        var newState = this.HistoryManager.top();
        this.emit(newState);
        return Promise.resolve(newState);
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
        _isNumber(to, ERRORS.MOVE_TO_NUMBER)
        if (
            // history is not active
            this.HistoryManager.maxElements === 1
            // unpushed changes
            || this.HistoryManager.index !== this.HistoryManager.stagedIndex
            // or to is not consumable
            || typeof to === 'undefined'
            || to === 0
        ) {
            return this;
        }
        
        var tmpIndex = this.HistoryManager.index + to,
            willChange = tmpIndex > -1 && tmpIndex < this.HistoryManager.states.length,
            newIndex = willChange ? tmpIndex : this.HistoryManager.index;
        this.HistoryManager.index = newIndex;
        this.HistoryManager.stagedIndex = newIndex;
        return this;
    };
    
    Store.prototype.replaceReducer = function (r) {
        _isFunction(r, ERRORS.SUBSCRIBERS_FUNCTION);
        this.reducer = r;
        return this;
    };
    
    Store.prototype.reset = function () {
        this.HistoryManager.reset();
        this.subscribers = [];
        return this;
    };

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
