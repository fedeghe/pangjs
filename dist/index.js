'use strict';
/*
PANGjs
v. 0.0.1

Size: ~3.75KB
*/
var PANGjs=function(){"use strict";function t(t,e){if("function"!=typeof t)throw new Error(e)}function e(t,e){if("Promise"!==t.constructor.name)throw new Error(e)}function s(t,e){
if("number"!=typeof t)throw new Error(e)}function n(t,e){this.states=[t],this.unpushedStates=[t],this.config=e,this.maxElements=Math.max(1,parseInt(this.config.maxElements,10))||1,this.index=0,
this.unpushedIndex=0}function i(e,s,i){this.reducer=e||o,t(this.reducer,r.REDUCERS_FUNCTION),this.initState=s||{},this.config=i||{},this.config.check=this.config.check||function(){return!0},
t(this.config.check,r.REDUCERS_FUNCTION),this.subscribers=[],this.previousAction="ORIGIN",this.HistoryManager=new n(this.initState,this.config)}var r={
REDUCERS_FUNCTION:"[ERROR] Reducer must be a function!",REDUCERS_RETURN:"[ERROR] Reducer should return a promise!",REDUCERS_ASYNC:"[ERROR] Reducer should be asynchronous!",
SUBSCRIBERS_FUNCTION:"[ERROR] Subscribers must be a functions!",ACTION_TYPE:"[ERROR] Actions needs a type!",UNAUTHORIZED_STATECHANGE:"[ERROR] State transition not allowed!",
MOVE_TO_NUMBER:"[ERROR] Move requires a number!"};n.prototype.top=function(t){return this[t?"unpushedStates":"states"][this[t?"unpushedIndex":"index"]]},n.prototype.commit=function(t,e){
var s=this.unpushedStates.slice(0,this.unpushedIndex+1);return s.push(t),this.maxElements&&s.length>this.maxElements?s.shift():this.unpushedIndex++,this.unpushedStates=s,e&&this.push(),this},
n.prototype.push=function(){this.states=this.unpushedStates,this.index=this.unpushedIndex},n.prototype.reset=function(){this.index=0,this.states=this.states.slice(0,1),this.unpushedIndex=0,
this.unpushedStates=this.unpushedStates.slice(0,1)};var o=function(){return Promise.resolve({})};return i.prototype.getState=function(t){return this.HistoryManager.top(t)},
i.prototype.uncommit=function(){if(1===this.HistoryManager.maxElements)return this;this.HistoryManager.unpushedIndex=this.HistoryManager.index,
this.HistoryManager.unpuhedStates=this.HistoryManager.states},i.prototype.commit=function(t,s){if(!("type"in t))return Promise.reject(new Error(r.ACTION_TYPE))
;var n=this,i=t.type,o=t.payload||{},u=this.getState(!0);if(!n.config.check(u,n.previousAction,i,o))return Promise.reject(new Error(r.UNAUTHORIZED_STATECHANGE));var h=this.reducer(u,i,o)
;return e(h,r.REDUCERS_RETURN),this.previousAction=i,h.then(function(t){return n.HistoryManager.commit(t,s),t})},i.prototype.push=function(t){if(t)return this.commit(t,!0);this.HistoryManager.push()
;var e=this.HistoryManager.top();return this.subscribers.filter(function(t){return Boolean(t)}).forEach(function(t){t(e)}),Promise.resolve(e)},i.prototype.subscribe=function(e){
t(e,r.SUBSCRIBERS_FUNCTION);var s,n=this;return this.subscribers.push(e),s=this.subscribers.length-1,function(){n.subscribers[s]=null}},i.prototype.move=function(t){if(s(t,r.MOVE_TO_NUMBER),
1===this.HistoryManager.maxElements||this.HistoryManager.index!==this.HistoryManager.unpushedIndex||void 0===t||0===t)return this
;var e=this.HistoryManager.index+t,n=e>-1&&e<this.HistoryManager.states.length,i=n?e:this.HistoryManager.index;return this.HistoryManager.index=i,this.HistoryManager.unpushedIndex=i,this},
i.prototype.replaceReducer=function(e){return t(e,r.SUBSCRIBERS_FUNCTION),this.reducer=e,this},i.prototype.reset=function(){return this.HistoryManager.reset(),this.subscribers=[],this},{ERRORS:r,
getStore:function(t,e,s){return new i(t,e,s)},isStore:function(t){return t instanceof i},combine:function(e){return e.forEach(function(e){t(e,r.REDUCERS_FUNCTION)}),function(t,s,n){
var i=Object.assign({},t),r=e.length;return new Promise(function(t){return e.reduce(function(e,i,o){return e.then(function(e){return r-1===o?t(i(e,s,n)):i(e,s,n)})},Promise.resolve(i))})}}}}()
;"object"==typeof exports&&(module.exports=PANGjs);