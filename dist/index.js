'use strict';
/*
PANGjs
v. 0.0.10

Size: ~3.93KB
*/
var PANGjs=function(){"use strict";function t(t,e){if("function"!=typeof t)throw new Error(e)}function e(t,e){if("Promise"!==t.constructor.name)throw new Error(e)}function s(t,e){
if("number"!=typeof t)throw new Error(e)}function i(t,e){this.initState=t,this.states=[t],this.stagedStates=[t],this.subscribers=[],this.config=e,
this.maxElements=Math.max(1,parseInt(this.config.maxElements,10))||1,this.index=0,this.stagedIndex=0}function r(e,s,r){this.reducer=e||o,t(this.reducer,n.REDUCERS_FUNCTION),this.initState=s||{},
this.config=r||{},this.config.check=this.config.check||function(){return!0},t(this.config.check,n.REDUCERS_FUNCTION),this.previousAction="pIG-pANG",
this.HistoryManager=new i(this.initState,this.config)}var n={REDUCERS_FUNCTION:"[ERROR] Reducer must be a function!",REDUCERS_RETURN:"[ERROR] Reducer should return a promise!",
REDUCERS_ASYNC:"[ERROR] Reducer should be asynchronous!",SUBSCRIBERS_FUNCTION:"[ERROR] Subscribers must be a functions!",ACTION_TYPE:"[ERROR] Actions needs a type!",
UNAUTHORIZED_STATECHANGE:"[ERROR] State transition not allowed!",MOVE_TO_NUMBER:"[ERROR] Move requires a number!"};i.prototype.top=function(t){
return this[t?"stagedStates":"states"][this[t?"stagedIndex":"index"]]},i.prototype.subscribe=function(e){t(e,n.SUBSCRIBERS_FUNCTION);var s,i=this;return this.subscribers.push(e),
s=this.subscribers.length-1,function(){i.subscribers[s]=null}},i.prototype.stage=function(t,e){var s=this.stagedStates.slice(0,this.stagedIndex+1);return s.push(t),
this.maxElements&&s.length>this.maxElements?s.shift():this.stagedIndex++,this.stagedStates=Array.from(s),e&&this.sync(),this},i.prototype.sync=function(){this.states=Array.from(this.stagedStates),
this.index=this.stagedIndex},i.prototype.emit=function(t){this.subscribers.filter(function(t){return Boolean(t)}).forEach(function(e){e(t)})},i.prototype.reset=function(){this.index=0,
this.states=[this.initState],this.stagedIndex=0,this.stagedStates=[this.initState]};var o=function(){return Promise.resolve({})};return r.prototype.getState=function(t){
return this.HistoryManager.top(t)},r.prototype.unstage=function(){if(1===this.HistoryManager.maxElements)return this;this.HistoryManager.stagedIndex=this.HistoryManager.index,
this.HistoryManager.stagedStates=this.HistoryManager.states},r.prototype.stage=function(t,s){if(!("type"in t))return Promise.reject(new Error(n.ACTION_TYPE))
;var i=this,r=t.type,o=t.payload||{},a=this.getState(!0);if(!i.config.check(a,i.previousAction,r,o))return Promise.reject(new Error(n.UNAUTHORIZED_STATECHANGE));var u=this.reducer(a,r,o)
;return e(u,n.REDUCERS_RETURN),this.previousAction=r,u.then(function(t){return i.HistoryManager.stage(t,s),s&&i.HistoryManager.emit(t),t})},r.prototype.dispatch=function(t){
if(t)return this.stage(t,!0);this.HistoryManager.sync();var e=this.HistoryManager.top(!0);return this.HistoryManager.emit(e),Promise.resolve(e)},r.prototype.subscribe=function(t){
return this.HistoryManager.subscribe(t)},r.prototype.move=function(t){if(s(t,n.MOVE_TO_NUMBER),
1===this.HistoryManager.maxElements||this.HistoryManager.index!==this.HistoryManager.stagedIndex||void 0===t||0===t)return this
;var e=this.HistoryManager.index+t,i=e>-1&&e<this.HistoryManager.states.length,r=i?e:this.HistoryManager.index;return this.HistoryManager.index=r,this.HistoryManager.stagedIndex=r,this},
r.prototype.replaceReducer=function(e){return t(e,n.SUBSCRIBERS_FUNCTION),this.reducer=e,this},r.prototype.reset=function(){return this.HistoryManager.emit(this.initState),this.HistoryManager.reset(),
this},{ERRORS:n,getStore:function(t,e,s){return new r(t,e,s)},isStore:function(t){return t instanceof r},combine:function(e){return e.forEach(function(e){t(e,n.REDUCERS_FUNCTION)}),function(t,s,i){
var r=Object.assign({},t),n=e.length;return new Promise(function(t){return e.reduce(function(e,r,o){return e.then(function(e){return n-1===o?t(r(e,s,i)):r(e,s,i)})},Promise.resolve(r))})}}}}()
;"object"==typeof exports&&(module.exports=PANGjs);