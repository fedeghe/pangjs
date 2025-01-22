var defaultReducer = function(){
    return Promise.resolve({})
};

function Store(reducer, initState, config) {
    this.reducer = reducer || defaultReducer;
    _isFunction(this.reducer, ERRORS.REDUCERS_FUNCTION);
    this.initState = initState || {};
    this.config = config || {};
    this.config.check = this.config.check || function (){return true};
    _isFunction(this.config.check, ERRORS.REDUCERS_FUNCTION);
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
        if(autoDispatch) {
            self.HistoryManager.emit(newState);
        }
        return newState;
    });
};

Store.prototype.dispatch = function (action) {
    if(action) return this.stage(action, true);
    this.HistoryManager.sync();

    var newState = this.HistoryManager.top(true);
    this.HistoryManager.emit(newState);
    return Promise.resolve(newState);
};

Store.prototype.subscribe = function (fn) {
    return this.HistoryManager.subscribe(fn);
}

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
    this.HistoryManager.emit(this.initState);
    this.HistoryManager.reset();
    return this;
};