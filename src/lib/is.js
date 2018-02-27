import _is from '@sindresorhus/is';
import {is as ramdaIs} from 'ramda';


function is(...args) {
  return _is(...args);
}


Object.setPrototypeOf(is, _is);


Object.defineProperties(is, {
  /**
   * Provided two classes (or constructor functions), returns true if the second
   * is a subclass (re: extends) the first.
   *
   * @param  {function|class} parent
   * @param  {function|class} child
   * @return {boolean}
   */
  subclassOf: {
    value: (child, parent) => child.prototype instanceof parent
  },

  /**
   * Returns true if the provided instance is an instance of the provided class or
   * constructor function.
   *
   * @param  {function|class} Ctor
   * @param  {any} instance
   * @return {boolean}
   */
  instanceOf: {
    value: ramdaIs
  }
});


export default is;
