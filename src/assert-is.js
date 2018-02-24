import is from '@sindresorhus/is';
import {__, curry, partial} from 'ramda';


/**
 * @private
 *
 * Performs an assertion. If it fails, an error with the provided message is
 * thrown. If it passes, the value is returned.
 *
 * @param  {string} method - Method in "is" to use for assertion.
 * @param  {any} [qualifier] - Optional qualifier, for methods that use them.
 * @param  {any} value - Value to check.
 * @param  {string} message - Error message to use if the assertion fails.
 * @return {any} - Returns 'value' if assertion passes.
 */
function assertOrThrow({method, qualifier, value, message}) {
  if (!is[method](value, qualifier)) {
    throw new TypeError(message);
  }

  return value;
}


/**
 * @private
 *
 * Accepts an "is" method and returns an appropriate handler.
 *
 * @param  {string} method - Method on "is" to use for assertion.
 * @return {function}
 */
function getHandler(method) {
  const handlers = {
    directInstanceOf: (expectedClass, value) => {
      if (is.undefined(value)) {
        return curry(assertIs)(method, expectedClass, __);
      }

      return assertOrThrow({
        method: 'directInstanceOf',
        qualifier: expectedClass,
        value,
        message: `Expected value to be a direct instance of "${expectedClass.name}", got "${is(value)}".`
      });
    },
    inRange: (rangeOrUpperBound, value) => {
      if (is.undefined(value)) {
        return curry(assertIs)(method, rangeOrUpperBound, __);
      }

      if (Array.isArray(rangeOrUpperBound)) {
        const [low, high] = rangeOrUpperBound;

        return assertOrThrow({
          method: 'inRange',
          qualifier: rangeOrUpperBound,
          value,
          message: `Expected value ${value} to be between ${low} and ${high}.`
        });
      }

      return assertOrThrow({
        method: 'inRange',
        qualifier: rangeOrUpperBound,
        value,
        message: `Expected value ${value} to be less than or equal to ${rangeOrUpperBound}.`
      });
    },
    truthy: value => assertOrThrow({
      method: 'truthy',
      value,
      message: `Expected value to be truthy, got "${value}".`
    }),
    falsy: value => assertOrThrow({
      method: 'falsy',
      value,
      message: `Expected value to be falsy, got "${is(value)}".`
    }),
    default: value => assertOrThrow({
      method,
      value,
      message: `Expected value to be of type "${method}", got "${is(value)}".`
    })
  };

  return handlers[method] || handlers.default;
}


/**
 * Accepts a method name on "is", and either a value or qualifier and value.
 * Performs an assertion and throws an error if it fails. Otherwise, returns
 * the value.
 *
 * @param  {string} method
 * @param  {any} a - Value or qualifier.
 * @param  {any} b - Value, if 'a' is a qualifier.
 * @return {any} - Value, if assersion passed.
 */
export default function assertIs(method, a, b) {
  if (['all', 'any'].includes(method)) {
    throw new Error(`[assertIs] Assertions using "${method}" are not supported.`);
  }

  if (!Reflect.has(is, method)) {
    throw new Error(`[assertIs] Assertion type "${method}" is invalid.`);
  }

  if (Array.from(arguments).length === 1) {
    return partial(assertIs, [method]);
  }

  return getHandler(method)(a, b);
}
