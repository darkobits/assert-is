import {propOr} from 'ramda';

/**
 * @private
 *
 * Maps the provided "is" method name to a descriptor. If the provided method
 * name is not in the map, it is returned.
 *
 * @param  {string} method
 * @return {string|array}
 */
export default function toTypeDescriptor(methodName) {
  return propOr(methodName, methodName, {
    array: 'Array',
    arrayBuffer: 'ArrayBuffer',
    arrayLike: 'array-like',
    asyncFunction: 'AsyncFunction',
    boundFunction: 'bound Function',
    buffer: 'Buffer',
    dataView: 'DataView',
    date: 'Date',
    domElement: 'HTMLElement',
    emptyOrWhitespace: 'empty or whitespace',
    error: 'Error',
    float32Array: 'Float32Array',
    float64Array: 'Float64Array',
    function: 'Function',
    generatorFunction: 'generator Function',
    int16Array: 'Int16Array',
    int32Array: 'Int32Array',
    int8Array: 'Int8Array',
    map: 'Map',
    nan: 'NaN',
    nativePromise: 'native Promise',
    nullOrUndefined: ['null', 'undefined'],
    plainObject: 'plain object',
    regExp: 'RegExp',
    safeInteger: 'safe integer',
    set: 'Set',
    sharedArrayBuffer: 'SharedArrayBuffer',
    symbol: 'Symbol',
    typedArray: 'typed Array',
    uint16Array: 'Uint16Array',
    uint32Array: 'Uint32Array',
    uint8Array: 'Uint8Array',
    uint8ClampedArray: 'Uint8ClampedArray',
    weakMap: 'WeakMap',
    weakSet: 'WeakSet'
  });
}
