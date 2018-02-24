import is from '@sindresorhus/is';
import {intersection, partial} from 'ramda';
import assertIs from './assert-is';


/**
 * Accepts a list of methods on "is", a value, or a qualifier and a value.
 * If the value fails all of the assertions, an error is thrown. Otherwise,
 * the value is returned.
 *
 * @param  {array} - List of "is" methods to use as predicates.
 * @param  {any} a - Value or qualifier.
 * @param  {any} b - Value, if 'a' is a qualifier.
 * @return {any} - Value, if any assertions passed.
 */
export default function assertAny(methods, a, b) {
  assertIs('array', methods);

  const unsuppoertedMethods = intersection(['inRange', 'directInstanceOf'], methods);

  if (unsuppoertedMethods.length > 0) {
    throw new Error(`Assertions using "${unsuppoertedMethods.join('", "')}" are not supported.`);
  }

  if (Array.from(arguments).length === 1) {
    return partial(assertAny, [methods]);
  }

  if (methods.length === 1) {
    return assertIs(methods[0], a, b);
  }

  const anyPass = methods.reduce((acc, method) => {
    try {
      assertIs(method, a, b);
      return acc || true;
    } catch (err) {
      return acc || false;
    }
  }, false);

  if (!anyPass) {
    throw new TypeError(`Expected value to be any of "${methods.join('" or "')}", got "${is(a)}".`);
  }

  return Array.from(arguments).length === 2 ? a : b;
}