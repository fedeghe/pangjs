/* eslint-disable no-unused-vars */
function _isFunction (o, msg) {
    if (typeof o !== 'function') { throw new Error(msg); }
}

// function _isDefined (o, msg) {
//     if (typeof o === 'undefined') { throw new Error(msg); }
// }

// function _isAsync(fn, msg) {
//     if (
//         fn.constructor.name !== "AsyncFunction"
//         && !('then' in fn())
//     ){ throw new Error(msg); };
// }

function _isPromise(p, msg) {
    if (p.constructor.name !== 'Promise'){ throw new Error(msg); };
}

function _isNumber(n, msg) {
    if (typeof n !== 'number') { throw new Error(msg); }
}