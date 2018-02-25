/**
 * Provided two classes (or constructor functions), returns true if the second
 * is a subclass (re: extends) the first.
 *
 * @param  {function|class} parent
 * @param  {function|class} child
 * @return {boolean}
 */
export default function isSubclassOf(child, parent) {
  return child.prototype instanceof parent;
}
