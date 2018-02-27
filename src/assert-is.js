import {
  chain,
  head,
  find,
  keys,
  intersection,
  is as isInstanceOf,
  path,
  partial,
  prop,
  values
} from 'ramda';

import is from 'lib/is';
import join from 'lib/join';


/**
 * @private
 *
 * List of "is" methods we never support.
 *
 * @type {array}
 */
const ALWAYS_UNSUPPORTED = ['all', 'any'];


/**
 * @private
 *
 * List of "is" methods we don't support when performing union type checks.
 *
 * @type {array}
 */
const UNSUPPORTED_WHEN_UNION = ['inRange', 'directInstanceOf'];


/**
 * @private
 *
 * Placeholder for labels used in error messages.
 *
 * @type {string}
 */
const LABEL_PLACEHOLDER = '%LABEL%';


/**
 * @private
 *
 * Curried join() that will join arrays into strings using "or".
 *
 * @param  {array} - Array of items to join.
 * @return {string}
 */
const orJoin = join(', ', ' or ');


/**
 * @private
 *
 * Maps the provided "is" method name to a descriptor.
 *
 * @param  {string} method
 * @return {string|array}
 */
function toTypeDescriptor(method) {
  const methodToDescriptor = {
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
  };

  return methodToDescriptor[method] || method;
}


/**
 * @private
 *
 * "Container" returned by handlers when a type assertion succeeds. Contains the
 * value that was tested.
 */
class PassedAssertion {
  constructor(value) {
    this.value = value;
  }
}


/**
 * @private
 *
 * "Container" returned by handlers when a type assertion fails. Contains the
 * value that was tested, the type of error that should be thrown, and the error
 * message.
 */
class FailedAssertion {
  constructor(value, ErrorCtor, message) {
    this.value = value;
    this.Error = ErrorCtor;
    this.message = message;
  }
}


/**
 * @private
 *
 * Provided an "is" method, determines when to perform partial application, how
 * to perform assertions, and the type and copy for error messages should the
 * assertion fail.
 *
 * @param  {string} method - "is" method requested by the consumer.
 * @return {function} - Assertion handler.
 */
class AssertionHandler {
  constructor(method) {
    // Return the handler for the provided method, or the default handler.
    return (this[method] || this.default(method)).bind(this);
  }

  instanceOf(expectedClass, value) {
    // If we were not provided a value, return a partially-applied version of
    // assertIs that accepts a value.
    if (arguments.length === 1) {
      return partial(assertIs, ['instanceOf', expectedClass]);
    }

    if (is.instanceOf(expectedClass, value)) {
      return new PassedAssertion(value);
    }

    return new FailedAssertion(
      value,
      TypeError,
      `Expected ${LABEL_PLACEHOLDER} to be an instance of "${expectedClass.name}".`
    );
  }

  directInstanceOf(expectedClass, value) {
    // If we were not provided a value, return a partially-applied version of
    // assertIs that accepts a value.
    if (arguments.length === 1) {
      return partial(assertIs, ['directInstanceOf', expectedClass]);
    }

    if (is.directInstanceOf(expectedClass, value)) {
      return new PassedAssertion(value);
    }

    // If provided an instance of the wrong class, use that class' name. If
    // provided some other value, use a descriptor for its type.
    const valueDescriptor = path(['constructor', 'name'], value) || toTypeDescriptor(is(value));

    return new FailedAssertion(
      value,
      TypeError,
      `Expected ${LABEL_PLACEHOLDER} to be a direct instance of "${expectedClass.name}", got "${valueDescriptor}".`
    );
  }

  subclassOf(expectedClass, value) {
    // If we were not provided a value, return a partially-applied version of
    // assertIs that accepts a value.
    if (arguments.length === 1) {
      return partial(assertIs, ['subclassOf', expectedClass]);
    }

    if (is.subclassOf(expectedClass, value)) {
      return new PassedAssertion(value);
    }

    return new FailedAssertion(
      value,
      TypeError,
      `Expected ${LABEL_PLACEHOLDER} to be a subclass of "${expectedClass.name}".`
    );
  }

  inRange(rangeOrUpperBound, value) {
    // If we were not provided a value, return a partially-applied version of
    // assertIs that accepts a value.
    if (arguments.length === 1) {
      return partial(assertIs, ['inRange', rangeOrUpperBound]);
    }

    if (is.inRange(rangeOrUpperBound, value)) {
      return new PassedAssertion(value);
    }

    // "inRange" accepts either a value (max) or an array (min, max). Determine
    // which error copy to use based on which invocation was used.
    let message;

    if (Array.isArray(rangeOrUpperBound)) {
      const [low, high] = rangeOrUpperBound;
      message = `Expected ${LABEL_PLACEHOLDER} ${value} to be between ${low} and ${high}.`;
    } else {
      message = `Expected ${LABEL_PLACEHOLDER} ${value} to be less than or equal to ${rangeOrUpperBound}.`;
    }

    return new FailedAssertion(
      value,
      RangeError,
      message
    );
  }

  truthy(value) {
    if (is.truthy(value)) {
      return new PassedAssertion(value);
    }

    return new FailedAssertion(
      value,
      TypeError,
      `Expected ${LABEL_PLACEHOLDER} to be truthy, got "${value}".`
    );
  }

  falsy(value) {
    if (is.falsy(value)) {
      return new PassedAssertion(value);
    }

    return new FailedAssertion(
      value,
      TypeError,
      `Expected ${LABEL_PLACEHOLDER} to be falsy, got "${toTypeDescriptor(is(value))}".`
    );
  }


  /**
   * Default handler for most "is" methods that don't require qualifiers or
   * custom copy. Accepts a method and returns a function that accepts a value
   * to be asserted.
   *
   * @param  {string} method - "is" method to use for assertion.
   * @return {function}
   */
  default(method) {
    return value => {
      if (is[method](value)) {
        return new PassedAssertion(value);
      }

      return new FailedAssertion(
        value,
        TypeError,
        `Expected ${LABEL_PLACEHOLDER} to be of type "${toTypeDescriptor(method)}", got "${toTypeDescriptor(is(value))}".`
      );
    };
  }
}


/**
 * @private
 *
 * Processes a collection of passed/failed assertions and either throws an error
 * or returns the tested value.
 *
 * @param  {array} results - Collection of PassedAssertion/FailedAssertion
 *   instances.
 * @param  {object} [ctx] - Optional context.
 * @return {any}
 */
function parseResults(results, ctx = {}) {
  // If provided, format 'context' into a prefix.
  const context = ctx.context ? `[${ctx.context}] ` : '';

  // Use the provided label or 'value'.
  const label = ctx.label || 'value';

  // If there is more than one result, we are doing a union type assertion.
  const isUnion = values(results).length > 1;

  // Find the first passing assertion in results.
  const firstPassedAssertion = find(isInstanceOf(PassedAssertion), values(results));

  // Find the first failing assertion in results.
  const firstFailedAssertion = (find(isInstanceOf(FailedAssertion), values(results)));


  // ----- Union Type Checks ---------------------------------------------------

  if (isUnion) {
    // Return the 'value' from the first passing assertion, if there was one.
    if (firstPassedAssertion) {
      return firstPassedAssertion.value;
    }

    // Otherwise, generate type descriptors for all expected types and the
    // received type.
    const expectedTypes = orJoin(chain(toTypeDescriptor, keys(results)).map(JSON.stringify));
    const receivedType = toTypeDescriptor(is(prop('value', firstFailedAssertion)));

    throw new TypeError(`${context}Expected type of ${label} to be either ${expectedTypes}. Got "${receivedType}".`);
  }


  // ----- Simple Type Checks --------------------------------------------------

  // If we have a PassedAssertion, return its 'value'.
  if (firstPassedAssertion) {
    return firstPassedAssertion.value;
  }

  // If we have a FailedAssertion, throw its error.
  if (firstFailedAssertion) {
    throw new firstFailedAssertion.Error(`${context}${firstFailedAssertion.message.replace(LABEL_PLACEHOLDER, label)}`);
  }

  // Otherwise, get the first result.
  const firstResult = head(values(results));

  // If we have a function, assume the handler returned a partial application.
  if (is.function(firstResult)) {
    return firstResult;
  }
}


/**
 * Accepts one or more method names on "is" and either a value or qualifier and
 * value. Performs an assertion and throws an error if it fails. Otherwise,
 * returns the value.
 *
 * @param  {string} method
 * @param  {any} a - Value or qualifier.
 * @param  {any} b - Value, if 'a' is a qualifier.
 * @return {any} - Value, if assersion passed.
 */
function assertIs(methodOrMethods, ...args) {
  const context = this;
  const methods = [].concat(methodOrMethods);
  const isUnion = methods.length > 1;

  // Ensure unsupported methods were not used.
  if (intersection(methods, ALWAYS_UNSUPPORTED).length > 0) {
    throw new Error(`[assertIs] Assertions using "${methods.join('", or "')}" are not supported.`);
  }

  // If performing a union (any) type check, ensure methods that require
  // qualifiers were not used.
  if (isUnion) {
    const usedUnsupportedUnionMethods = intersection(methods, UNSUPPORTED_WHEN_UNION);

    if (usedUnsupportedUnionMethods.length > 0) {
      throw new Error(`[assertIs] Assertions using "${orJoin(usedUnsupportedUnionMethods)}" are not supported for union types.`);
    }
  }

  // If we only received a method (or methods), and no qualifier or value,
  // return a partially-applied version of assertIs.
  if (arguments.length === 1) {
    return partial(assertIs, [methods]);
  }

  // Otherwise, iterate over the array of methods and create an assertion
  // handler for each. Return an object that maps each method name to an
  // instance of PassedAssertion or FailedAssertion.
  return parseResults(methods.reduce((acc, method) => {
    if (!is.function(is[method])) {
      throw new Error(`[assertIs] Assertion type "${method}" is invalid.`);
    }

    return {...acc, [method]: new AssertionHandler(method, context)(...args)};
  }, {}), context);
}


/**
 * Returns a version of assertIs that will prefix errors thrown with the
 * provided string. Note: When using contexts, the tested value is not returned.
 *
 * @param  {string} context - Context (used to prefix error messages).
 * @return {function}
 */
assertIs.context = context => {
  assertIs('string', context);

  function ContextualAssert(...args) {
    Reflect.apply(assertIs, {context}, args);
    return ContextualAssert;
  }

  /**
   * Replaces the default 'value' copy in thrown errors with the provided label.
   *
   * @param {string} label
   */
  ContextualAssert.label = (label, ...args) => {
    return {
      is(methodOrMethods, qualifier) {
        if (qualifier) {
          Reflect.apply(assertIs, {context, label}, [methodOrMethods, qualifier, ...args]);
        } else {
          Reflect.apply(assertIs, {context, label}, [methodOrMethods, ...args]);
        }

        return ContextualAssert;
      }
    };
  };

  // Alias "arg" -> "label".
  ContextualAssert.arg = ContextualAssert.label;

  return ContextualAssert;
};


// Alias "ctx" -> "context";
assertIs.ctx = assertIs.context;


export default assertIs;
