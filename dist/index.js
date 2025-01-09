'use strict';
/*
PANGjs
v. 1.0.0
23:53:23
Size: ~2.45KB
*/
var PANGjs=function(){"use strict";function t(t,e){if("function"!=typeof t)throw new Error(e)}function e(t,e){this.states=[t||{}],this.unpushedStates=[t||{}],this.config=e||{},
this.maxElements=this.config.maxElements||!1,this.index=0,this.unpushedIndex=0}function s(t,s,n){this.reducer=t||i,this.initState=s||{},this.config=n||{},this.subscribers=[],
this.HistoryManager=new e(this.initState,this.config)}var n={REDUCERS_FUNCTION:"[ERROR] Reducer must be a function!",REDUCERS_RETURN:"[ERROR] Reducer should return something!",
SUBSCRIBERS_FUNCTION:"[ERROR] Subscribers must be a functions!",ACTION_TYPE:"[ERROR] Actions needs a type",UNAUTHORIZED_STATECHANGE:"[ERROR] State transition not allowed"};e.prototype.top=function(t){
return this[t?"unpushedStates":"states"][this[t?"unpushedIndex":"index"]]},e.prototype.commit=function(t,e){var s=this.unpushedStates.slice(0,this.unpushedIndex+1);return s.push(t),
this.maxElements&&s.length>this.maxElements?s.shift():this.unpushedIndex++,this.unpushedStates=s,e&&this.push(),this},e.prototype.push=function(){this.states=this.unpushedStates,
this.index=this.unpushedIndex},e.prototype.reset=function(){this.index=0,this.states=this.states.slice(0,1),this.unpushedIndex=0,this.unpushedStates=this.unpushedStates.slice(0,1)};var i=function(){
return Promise.resolve({})};return s.prototype.getState=function(t){return this.HistoryManager.top(t)},s.prototype.dispatch=function(t,e){if(!("type"in t))return Promise.reject(n.ACTION_TYPE)
;var s=this,i=t.type,r=t.payload||{},u=this.getState(!0);return this.reducer(u,i,r).then(function(t){return s.HistoryManager.commit(t,e),t})},s.prototype.push=function(){this.HistoryManager.push()
;var t=this.HistoryManager.top();this.subscribers.forEach(function(e){e(t)})},s.prototype.subscribe=function(e){t(e,n.SUBSCRIBERS_FUNCTION);var s,i=this;return this.subscribers.push(e),
s=this.subscribers.length-1,function(){i.subscribers[s]=null}},s.prototype.replaceReducer=function(t){this.reducer=t||i},s.prototype.reset=function(){this.HistoryManager.reset(),this.subscribers=[]},{
ERRORS:n,getStore:function(t,e,n){return new s(t,e,n)},isStore:function(t){return t instanceof s},combine:function(t){return function(e,s,n){e=e||initState;var i=Object.assign({},e),r=t.length
;return new Promise(function(e){return t.reduce(function(t,i,u){return t.then(function(t){return r-1===u?e(i(t,s,n)):i(t,s,n)})},Promise.resolve(i))})}}}}()
;"object"==typeof exports&&(module.exports=PANGjs);