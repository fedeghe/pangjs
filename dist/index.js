'use strict';
/*
PANGjs
v. 0.0.8

Size: ~3.77KB
*/
var PANGjs=function(){"use strict";function t(t,e){if("function"!=typeof t)throw new Error(e)}function e(t,e){if("Promise"!==t.constructor.name)throw new Error(e)}function s(t,e){
if("number"!=typeof t)throw new Error(e)}function i(t,e){this.initState=t,this.states=[t],this.stagedStates=[t],this.config=e,this.maxElements=Math.max(1,parseInt(this.config.maxElements,10))||1,
this.index=0,this.stagedIndex=0}function n(t){this.subscribers.filter(function(t){return Boolean(t)}).forEach(function(e){e(t)})}function r(e,s,n){this.reducer=e||a,
t(this.reducer,o.REDUCERS_FUNCTION),this.initState=s||{},this.config=n||{},this.config.check=this.config.check||function(){return!0},t(this.config.check,o.REDUCERS_FUNCTION),this.subscribers=[],
this.previousAction="ORIGIN",this.HistoryManager=new i(this.initState,this.config)}var o={REDUCERS_FUNCTION:"[ERROR] Reducer must be a function!",
REDUCERS_RETURN:"[ERROR] Reducer should return a promise!",REDUCERS_ASYNC:"[ERROR] Reducer should be asynchronous!",SUBSCRIBERS_FUNCTION:"[ERROR] Subscribers must be a functions!",
ACTION_TYPE:"[ERROR] Actions needs a type!",UNAUTHORIZED_STATECHANGE:"[ERROR] State transition not allowed!",MOVE_TO_NUMBER:"[ERROR] Move requires a number!"};i.prototype.top=function(t){
return this[t?"stagedStates":"states"][this[t?"stagedIndex":"index"]]},i.prototype.stage=function(t,e){var s=this.stagedStates.slice(0,this.stagedIndex+1);return s.push(t),
this.maxElements&&s.length>this.maxElements?s.shift():this.stagedIndex++,this.stagedStates=s,e&&this.sync(),this},i.prototype.sync=function(){this.states=this.stagedStates,this.index=this.stagedIndex
},i.prototype.reset=function(){this.index=0,this.states=[this.initState],this.stagedIndex=0,this.stagedStates=[this.initState]};var a=function(){return Promise.resolve({})}
;return r.prototype.getState=function(t){return this.HistoryManager.top(t)},r.prototype.unstage=function(){if(1===this.HistoryManager.maxElements)return this
;this.HistoryManager.stagedIndex=this.HistoryManager.index,this.HistoryManager.stagedStates=this.HistoryManager.states},r.prototype.stage=function(t,s){
if(!("type"in t))return Promise.reject(new Error(o.ACTION_TYPE));var i=this,r=t.type,a=t.payload||{},h=this.getState(!0)
;if(!i.config.check(h,i.previousAction,r,a))return Promise.reject(new Error(o.UNAUTHORIZED_STATECHANGE));var u=this.reducer(h,r,a);return e(u,o.REDUCERS_RETURN),this.previousAction=r,
u.then(function(t){return i.HistoryManager.stage(t,s),s&&n.call(i,t),t})},r.prototype.dispatch=function(t){if(t)return this.stage(t,!0);this.HistoryManager.sync();var e=this.HistoryManager.top()
;return n.call(this,e),Promise.resolve(e)},r.prototype.subscribe=function(e){t(e,o.SUBSCRIBERS_FUNCTION);var s,i=this;return this.subscribers.push(e),s=this.subscribers.length-1,function(){
i.subscribers[s]=null}},r.prototype.move=function(t){
if(s(t,o.MOVE_TO_NUMBER),1===this.HistoryManager.maxElements||this.HistoryManager.index!==this.HistoryManager.stagedIndex||void 0===t||0===t)return this
;var e=this.HistoryManager.index+t,i=e>-1&&e<this.HistoryManager.states.length,n=i?e:this.HistoryManager.index;return this.HistoryManager.index=n,this.HistoryManager.stagedIndex=n,this},
r.prototype.replaceReducer=function(e){return t(e,o.SUBSCRIBERS_FUNCTION),this.reducer=e,this},r.prototype.reset=function(){return this.HistoryManager.reset(),n.call(this,this.initState),this},{
ERRORS:o,getStore:function(t,e,s){return new r(t,e,s)},isStore:function(t){return t instanceof r},combine:function(e){return e.forEach(function(e){t(e,o.REDUCERS_FUNCTION)}),function(t,s,i){
var n=Object.assign({},t),r=e.length;return new Promise(function(t){return e.reduce(function(e,n,o){return e.then(function(e){return r-1===o?t(n(e,s,i)):n(e,s,i)})},Promise.resolve(n))})}}}}()
;"object"==typeof exports&&(module.exports=PANGjs);