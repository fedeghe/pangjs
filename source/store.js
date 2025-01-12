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

Store.prototype.uncommit = function () {
    this.HistoryManager.unpushedIndex = this.HistoryManager.index;
    this.HistoryManager.unpuhedStates =  this.HistoryManager.states;
};

Store.prototype.commit = function (action, autoPush) {
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
    this.subscribers.filter(function(filter) {
        return Boolean(filter);
    }).forEach(function (subscriber) {
        subscriber(newState);
    });
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