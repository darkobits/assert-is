import assertIs from './assert-is';


/**
 * Returns a version of assertIs that will prefix errors thrown with the
 * provided string. Note: When using contexts, the tested value is not returned.
 *
 * @param {string} context - Context (used to prefix error messages).
 */
export default function Context(context) {
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
      is(methodOrMethods) {
        Reflect.apply(assertIs, {context, label}, [methodOrMethods, ...args]);
        return ContextualAssert;
      }
    };
  };

  // Alias "arg" to "label".
  ContextualAssert.arg = ContextualAssert.label;

  return ContextualAssert;
}
