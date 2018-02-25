/**
 * Returns true if the provided instance is an instance of the provided class or
 * constructor function.
 *
 * @param  {function|class} Ctor
 * @param  {any} instance
 * @return {boolean}
 */
export default function isInstanceOf(instance, Ctor) {
  return instance instanceof Ctor;
}
