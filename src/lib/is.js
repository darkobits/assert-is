import _is from '@sindresorhus/is';
import {flip, is as ramdaIs} from 'ramda';


function is(...args) {
  return Reflect.apply(_is, _is, args);
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
    value: (parent, child) => child.prototype instanceof parent
  },


  /**
   * Returns true if the provided instance is an instance of the provided class
   * or constructor function.
   *
   * @param  {function|class} Ctor
   * @param  {any} instance
   * @return {boolean}
   */
  instanceOf: {
    value: ramdaIs
  },


  // Reverse the parameter order of 'directInstanceOf'.
  directInstanceOf: {
    value: flip(_is.directInstanceOf).bind(_is)
  },


  // Reverse the parameter order of 'inRange'.
  inRange: {
    value: flip(_is.inRange)
  }
});


export default is;
