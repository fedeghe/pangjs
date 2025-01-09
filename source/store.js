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

Store.prototype.replaceReducer = function (reducer) {
    this.reducer = reducer || defaultReducer;
};

Store.prototype.reset = function () {
    this.HistoryManager.reset();
    this.subscribers = [];
};