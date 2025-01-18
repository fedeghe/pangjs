'use strict';
/*
PANGjs
v. 0.0.3

Size: ~3.82KB
*/
var PANGjs=function(){"use strict";function t(t,e){if("function"!=typeof t)throw new Error(e)}function e(t,e){if("Promise"!==t.constructor.name)throw new Error(e)}function n(t,e){
if("number"!=typeof t)throw new Error(e)}function i(t,e){this.initState=t,this.states=[t],this.unpushedStates=[t],this.config=e,this.maxElements=Math.max(1,parseInt(this.config.maxElements,10))||1,
this.index=0,this.unpushedIndex=0}function s(e,n,s){this.reducer=e||o,t(this.reducer,r.REDUCERS_FUNCTION),this.initState=n||{},this.config=s||{},this.config.check=this.config.check||function(){
return!0},t(this.config.check,r.REDUCERS_FUNCTION),this.subscribers=[],this.previousAction="ORIGIN",this.HistoryManager=new i(this.initState,this.config)}var r={
REDUCERS_FUNCTION:"[ERROR] Reducer must be a function!",REDUCERS_RETURN:"[ERROR] Reducer should return a promise!",REDUCERS_ASYNC:"[ERROR] Reducer should be asynchronous!",
SUBSCRIBERS_FUNCTION:"[ERROR] Subscribers must be a functions!",ACTION_TYPE:"[ERROR] Actions needs a type!",UNAUTHORIZED_STATECHANGE:"[ERROR] State transition not allowed!",
MOVE_TO_NUMBER:"[ERROR] Move requires a number!"};i.prototype.top=function(t){return this[t?"unpushedStates":"states"][this[t?"unpushedIndex":"index"]]},i.prototype.commit=function(t,e){
var n=this.unpushedStates.slice(0,this.unpushedIndex+1);return n.push(t),this.maxElements&&n.length>this.maxElements?n.shift():this.unpushedIndex++,this.unpushedStates=n,e&&this.push(),this},
i.prototype.push=function(){this.states=this.unpushedStates,this.index=this.unpushedIndex},i.prototype.reset=function(){this.index=0,this.states=[this.initState],this.unpushedIndex=0,
this.unpushedStates=this.unpushedStates.slice(0,1)};var o=function(){return Promise.resolve({})};return s.prototype.getState=function(t){return this.HistoryManager.top(t)},
s.prototype.uncommit=function(){if(1===this.HistoryManager.maxElements)return this;this.HistoryManager.unpushedIndex=this.HistoryManager.index,
this.HistoryManager.unpuhedStates=this.HistoryManager.states},s.prototype.commit=function(t,n){if(!("type"in t))return Promise.reject(new Error(r.ACTION_TYPE))
;var i=this,s=t.type,o=t.payload||{},u=this.getState(!0);if(!i.config.check(u,i.previousAction,s,o))return Promise.reject(new Error(r.UNAUTHORIZED_STATECHANGE));var h=this.reducer(u,s,o)
;return e(h,r.REDUCERS_RETURN),this.previousAction=s,h.then(function(t){return i.HistoryManager.commit(t,n),n&&i.emit(t),t})},s.prototype.emit=function(t){this.subscribers.filter(function(t){
return Boolean(t)}).forEach(function(e){e(t)})},s.prototype.push=function(t){if(t)return this.commit(t,!0);this.HistoryManager.push();var e=this.HistoryManager.top();return this.emit(e),
Promise.resolve(e)},s.prototype.subscribe=function(e){t(e,r.SUBSCRIBERS_FUNCTION);var n,i=this;return this.subscribers.push(e),n=this.subscribers.length-1,function(){i.subscribers[n]=null}},
s.prototype.move=function(t){if(n(t,r.MOVE_TO_NUMBER),1===this.HistoryManager.maxElements||this.HistoryManager.index!==this.HistoryManager.unpushedIndex||void 0===t||0===t)return this
;var e=this.HistoryManager.index+t,i=e>-1&&e<this.HistoryManager.states.length,s=i?e:this.HistoryManager.index;return this.HistoryManager.index=s,this.HistoryManager.unpushedIndex=s,this},
s.prototype.replaceReducer=function(e){return t(e,r.SUBSCRIBERS_FUNCTION),this.reducer=e,this},s.prototype.reset=function(){return this.HistoryManager.reset(),this.subscribers=[],this},{ERRORS:r,
getStore:function(t,e,n){return new s(t,e,n)},isStore:function(t){return t instanceof s},combine:function(e){return e.forEach(function(e){t(e,r.REDUCERS_FUNCTION)}),function(t,n,i){
var s=Object.assign({},t),r=e.length;return new Promise(function(t){return e.reduce(function(e,s,o){return e.then(function(e){return r-1===o?t(s(e,n,i)):s(e,n,i)})},Promise.resolve(s))})}}}}()
;"object"==typeof exports&&(module.exports=PANGjs);