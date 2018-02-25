import _is from '@sindresorhus/is';
import isInstanceOf from 'lib/is-instance-of';
import isSubclassOf from 'lib/is-subclass-of';

export default function is(...args) {
  return _is(...args);
}

Object.setPrototypeOf(is, _is);
Object.defineProperty(is, 'subclassOf', {value: isSubclassOf});
Object.defineProperty(is, 'instanceOf', {value: isInstanceOf});
