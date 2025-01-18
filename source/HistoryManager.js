function HistoryManager (initState, config) {
    this.initState = initState;
    this.states = [initState];
    this.unpushedStates = [initState];
    this.config = config;
    this.maxElements = Math.max(
        1,
        parseInt(this.config.maxElements, 10)
    ) || 1;
    this.index = 0;
    this.unpushedIndex = 0;
}

HistoryManager.prototype.top = function (unpushed) {
    return this[unpushed ? 'unpushedStates' : 'states'][
        this[unpushed ? 'unpushedIndex': 'index']
    ];
};

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
};

HistoryManager.prototype.push = function () {
    this.states = this.unpushedStates;
    this.index = this.unpushedIndex;
};

HistoryManager.prototype.reset = function () {
    this.index = 0;
    this.states = [this.initState];
    this.unpushedIndex = 0;
    this.unpushedStates = this.unpushedStates.slice(0, 1);
};