'use strict';
/*
PANGjs
v. 0.0.7

Size: ~3.78KB
*/
var PANGjs=function(){"use strict";function t(t,e){if("function"!=typeof t)throw new Error(e)}function e(t,e){if("Promise"!==t.constructor.name)throw new Error(e)}function i(t,e){
if("number"!=typeof t)throw new Error(e)}function s(t,e){this.initState=t,this.states=[t],this.stagedStates=[t],this.config=e,this.maxElements=Math.max(1,parseInt(this.config.maxElements,10))||1,
this.index=0,this.stagedIndex=0}function n(e,i,n){this.reducer=e||o,t(this.reducer,r.REDUCERS_FUNCTION),this.initState=i||{},this.config=n||{},this.config.check=this.config.check||function(){return!0
},t(this.config.check,r.REDUCERS_FUNCTION),this.subscribers=[],this.previousAction="ORIGIN",this.HistoryManager=new s(this.initState,this.config)}var r={
REDUCERS_FUNCTION:"[ERROR] Reducer must be a function!",REDUCERS_RETURN:"[ERROR] Reducer should return a promise!",REDUCERS_ASYNC:"[ERROR] Reducer should be asynchronous!",
SUBSCRIBERS_FUNCTION:"[ERROR] Subscribers must be a functions!",ACTION_TYPE:"[ERROR] Actions needs a type!",UNAUTHORIZED_STATECHANGE:"[ERROR] State transition not allowed!",
MOVE_TO_NUMBER:"[ERROR] Move requires a number!"};s.prototype.top=function(t){return this[t?"stagedStates":"states"][this[t?"stagedIndex":"index"]]},s.prototype.stage=function(t,e){
var i=this.stagedStates.slice(0,this.stagedIndex+1);return i.push(t),this.maxElements&&i.length>this.maxElements?i.shift():this.stagedIndex++,this.stagedStates=i,e&&this.sync(),this},
s.prototype.sync=function(){this.states=this.stagedStates,this.index=this.stagedIndex},s.prototype.reset=function(){this.index=0,this.states=[this.initState],this.stagedIndex=0,
this.stagedStates=[this.initState]};var o=function(){return Promise.resolve({})};return n.prototype.getState=function(t){return this.HistoryManager.top(t)},n.prototype.unstage=function(){
if(1===this.HistoryManager.maxElements)return this;this.HistoryManager.stagedIndex=this.HistoryManager.index,this.HistoryManager.stagedStates=this.HistoryManager.states},
n.prototype.stage=function(t,i){if(!("type"in t))return Promise.reject(new Error(r.ACTION_TYPE));var s=this,n=t.type,o=t.payload||{},a=this.getState(!0)
;if(!s.config.check(a,s.previousAction,n,o))return Promise.reject(new Error(r.UNAUTHORIZED_STATECHANGE));var h=this.reducer(a,n,o);return e(h,r.REDUCERS_RETURN),this.previousAction=n,
h.then(function(t){return s.HistoryManager.stage(t,i),i&&s.emit(t),t})},n.prototype.emit=function(t){this.subscribers.filter(function(t){return Boolean(t)}).forEach(function(e){e(t)})},
n.prototype.dispatch=function(t){if(t)return this.stage(t,!0);this.HistoryManager.sync();var e=this.HistoryManager.top();return this.emit(e),Promise.resolve(e)},n.prototype.subscribe=function(e){
t(e,r.SUBSCRIBERS_FUNCTION);var i,s=this;return this.subscribers.push(e),i=this.subscribers.length-1,function(){s.subscribers[i]=null}},n.prototype.move=function(t){if(i(t,r.MOVE_TO_NUMBER),
1===this.HistoryManager.maxElements||this.HistoryManager.index!==this.HistoryManager.stagedIndex||void 0===t||0===t)return this
;var e=this.HistoryManager.index+t,s=e>-1&&e<this.HistoryManager.states.length,n=s?e:this.HistoryManager.index;return this.HistoryManager.index=n,this.HistoryManager.stagedIndex=n,this},
n.prototype.replaceReducer=function(e){return t(e,r.SUBSCRIBERS_FUNCTION),this.reducer=e,this},n.prototype.reset=function(){return this.HistoryManager.reset(),this.emit(this.initState),this},{
ERRORS:r,getStore:function(t,e,i){return new n(t,e,i)},isStore:function(t){return t instanceof n},combine:function(e){return e.forEach(function(e){t(e,r.REDUCERS_FUNCTION)}),function(t,i,s){
var n=Object.assign({},t),r=e.length;return new Promise(function(t){return e.reduce(function(e,n,o){return e.then(function(e){return r-1===o?t(n(e,i,s)):n(e,i,s)})},Promise.resolve(n))})}}}}()
;"object"==typeof exports&&(module.exports=PANGjs);