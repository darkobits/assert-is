import {path, partial, propOr} from 'ramda';
import {LABEL_PLACEHOLDER} from 'etc/constants';
import is from 'lib/is';
import toTypeDescriptor from 'lib/to-type-descriptor';


/**
 * Provided an "is" method, determines when to perform partial application, how
 * to perform assertions, and the type and copy for error messages should the
 * assertion fail.
 *
 * @param  {string} method - "is" method requested by the consumer.
 * @param  {function} assertIs - Reference to assertIs, used when returning
 *   partially applied functions.
 * @return {function} - Assertion handler.
 */
export default function getAssertionHandler(method, assertIs) {
  /**
   * Default handler for most "is" methods that don't require qualifiers or
   * custom copy. Accepts a method and returns a function that accepts a value
   * to be asserted.
   *
   * @param  {string} method - "is" method to use for assertion.
   * @return {function}
   */
  function defaultHandler(value) {
    if (is[method](value)) {
      return value;
    }

    const err = new TypeError(`Expected ${LABEL_PLACEHOLDER} to be of type "${toTypeDescriptor(method)}", got "${toTypeDescriptor(is(value))}".`);
    err.value = value;
    throw err;
  }

  return propOr(defaultHandler, method, {
    instanceOf(expectedClass, value) {
      // If we were not provided a value, return a partially-applied version of
      // assertIs that accepts a value.
      if (arguments.length === 1) {
        return partial(assertIs, ['instanceOf', expectedClass]);
      }

      if (is.instanceOf(expectedClass, value)) {
        return value;
      }

      const err = new TypeError(`Expected ${LABEL_PLACEHOLDER} to be an instance of "${expectedClass.name}".`);
      err.value = value;
      throw err;
    },
    directInstanceOf(expectedClass, value) {
      // If we were not provided a value, return a partially-applied version of
      // assertIs that accepts a value.
      if (arguments.length === 1) {
        return partial(assertIs, ['directInstanceOf', expectedClass]);
      }

      if (is.directInstanceOf(expectedClass, value)) {
        return value;
      }

      // If provided an instance of the wrong class, use that class' name. If
      // provided some other value, use a descriptor for its type.
      const valueDescriptor = path(['constructor', 'name'], value) || toTypeDescriptor(is(value));

      const err = new TypeError(`Expected ${LABEL_PLACEHOLDER} to be a direct instance of "${expectedClass.name}", got "${valueDescriptor}".`);
      err.value = value;
      throw err;
    },
    subclassOf(expectedClass, value) {
      // If we were not provided a value, return a partially-applied version of
      // assertIs that accepts a value.
      if (arguments.length === 1) {
        return partial(assertIs, ['subclassOf', expectedClass]);
      }

      if (is.subclassOf(expectedClass, value)) {
        return value;
      }

      const err = new TypeError(`Expected ${LABEL_PLACEHOLDER} to be a subclass of "${expectedClass.name}".`);
      err.value = value;
      throw err;
    },
    inRange(rangeOrUpperBound, value) {
      // If we were not provided a value, return a partially-applied version of
      // assertIs that accepts a value.
      if (arguments.length === 1) {
        return partial(assertIs, ['inRange', rangeOrUpperBound]);
      }

      if (is.inRange(rangeOrUpperBound, value)) {
        return value;
      }

      // "inRange" accepts either a value (max) or an array (min, max).
      // Determine which error copy to use based on which invocation was used.
      let message;

      if (Array.isArray(rangeOrUpperBound)) {
        const [low, high] = rangeOrUpperBound;
        message = `Expected ${LABEL_PLACEHOLDER} ${value} to be between ${low} and ${high}.`;
      } else {
        message = `Expected ${LABEL_PLACEHOLDER} ${value} to be less than or equal to ${rangeOrUpperBound}.`;
      }

      const err = new RangeError(message);
      err.value = value;
      throw err;
    },
    truthy(value) {
      if (is.truthy(value)) {
        return value;
      }

      const err = new TypeError(`Expected ${LABEL_PLACEHOLDER} to be truthy, got "${value}".`);
      err.value = value;
      throw err;
    },
    falsy(value) {
      if (is.falsy(value)) {
        return value;
      }

      const err = new TypeError(`Expected ${LABEL_PLACEHOLDER} to be falsy, got "${toTypeDescriptor(is(value))}".`);
      err.value = value;
      throw err;
    }
  });
}
