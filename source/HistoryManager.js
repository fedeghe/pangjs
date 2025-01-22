function HistoryManager (initState, config) {
    this.initState = initState;
    this.states = [initState];
    this.stagedStates = [initState];
    this.subscribers = [];
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

HistoryManager.prototype.subscribe = function (subscriber) {
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
    this.stagedStates = Array.from(newStates);
    if (autoDispatch) this.sync();
    return this;
};

HistoryManager.prototype.sync = function () {
    this.states = Array.from(this.stagedStates);
    this.index = this.stagedIndex;
};
HistoryManager.prototype.emit = function (newState) {
    this.subscribers.filter(function(filter) {
        return Boolean(filter);
    }).forEach(function (subscriber) {
        subscriber(newState);
    });
};

HistoryManager.prototype.reset = function () {
    this.index = 0;
    this.states = [this.initState];
    this.stagedIndex = 0;
    this.stagedStates = [this.initState];
};