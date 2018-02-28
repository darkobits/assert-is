import {chain, intersection, partial, prop} from 'ramda';
import {ALWAYS_UNSUPPORTED, UNSUPPORTED_WHEN_UNION, LABEL_PLACEHOLDER} from 'etc/constants';

import getAssertionHandler from 'lib/get-assertion-handler';
import is from 'lib/is';
import join from 'lib/join';
import toTypeDescriptor from 'lib/to-type-descriptor';


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
  const ctx = this || {};

  // If provided, format 'context' into a prefix.
  const context = ctx.context ? `[${ctx.context}] ` : '';

  // Use the provided label or 'value'.
  const label = ctx.label || 'value';

  // Coerce first argument to an array.
  const methods = [].concat(methodOrMethods);

  // Determine if we're doing a union type check.
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

  let error;

  // Iterate over methods. On the first passing assertion, immediately return the value.
  for (const method of methods) {
    if (!is.function(is[method])) {
      throw new Error(`[assertIs] Assertion type "${method}" is invalid.`);
    }

    const handler = getAssertionHandler(method, assertIs);

    try {
      return handler(...args);
    } catch (err) {
      error = err;
    }
  }

  if (isUnion) {
    // If doing a union type check, generate descriptors for expected and
    // received types.
    const expectedTypes = orJoin(chain(toTypeDescriptor, methods).map(JSON.stringify));
    const receivedType = toTypeDescriptor(is(prop('value', error)));

    throw new TypeError(`${context}Expected type of ${label} to be either ${expectedTypes}. Got "${receivedType}".`);
  } else {
    // If doing a simple assertion, throw the same error type provided by the
    // handler, adding 'context' and replacing its label placeholder with the
    // correct value.
    throw new error.constructor(`${context}${error.message.replace(LABEL_PLACEHOLDER, label)}`);
  }
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
   * @param  {string} label
   * @return {object}
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
