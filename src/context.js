import assertIs from './assert-is';


/**
 * Returns a version of assertIs that will prefix errors thrown with the
 * provided string. Note: When using contexts, the tested value is not returned.
 *
 * Note: when using contexts, the tested value is not returned on successful
 * assertions.
 *
 * @example
 *
 * import assertionContext from '@darkobits/assert-is/context';
 *
 * function add (a, b) {
 *   const assert = assertionContext('add');
 *
 *   // Use assert just like assertIs:
 *   assert('number', a);
 *
 *   // This will throw errors like:
 *   // TypeError('[add] Expected value to be of type "number", got...');
 *
 *   // Or, use the 'arg/label' + 'is' methods to provide additional context
 *   // about an assertion.
 *   assert.arg('first argument', a).is('number');
 *
 *   // This will throw errors like:
 *   // TypeError('[add] Expected first argument to be of type "number", got...');
 *
 *   // You can also chain arg/is calls:
 *   assert.arg('first argument', a).is('number').arg('second argument', b).is('number');
 *
 *   return a + b;
 * }
 *
 * @param {string} context - Context (used to prefix error messages).
 */
export default function assertionContext(context) {
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

  // Alias "arg" to "label".
  ContextualAssert.arg = ContextualAssert.label;

  return ContextualAssert;
}
