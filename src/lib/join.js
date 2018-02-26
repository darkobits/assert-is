import {curry} from 'ramda';


/**
 * Joins arrays using a custom separator between elements N-1 and N.
 *
 * @example
 *
 * const guests = ['the strippers', 'JFK', 'Stalin'];
 * const andJoin = join(', ', ' and ');
 *
 * `We invited ${andJoin(guests)}.`;
 * //=> 'We invited the strippers, JFK, and Stalin.'
 *
 * @param {string} sep - Default separator.
 * @param {string} penultimateSep - Separator to use between elements N-1 and N.
 * @param {array} arr - Array to join.
 */
export default curry((sep, penultimateSep, arr) => {
  if (arr.length === 1) {
    return arr[0];
  }

  if (arr.length === 2) {
    const [first, second] = arr;
    return `${first}${penultimateSep}${second}`;
  }

  return arr.reduce((str, x, i) => {
    if (i === 0) {
      return x;
    }

    if (i === arr.length - 1) {
      return `${str}${sep}${penultimateSep.replace(/^\W*/, '')}${x}`;
    }

    return `${str}${sep}${x}`;
  }, '');
});
