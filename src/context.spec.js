import assert from './context';

describe('contexts', () => {
  function greet(salutation, title, first, last) {
    assert('Person::greet')
      .arg('salutation', salutation).is('string')
      .arg('title', title).is(['string', 'nullOrUndefined'])
      .arg('first name', first).is('string')
      .label('last name', last).is('string');

    return `${salutation}, ${title ? `${title} ` : ''}${first} ${last}!`;
  }

  function add(a, b) {
    const ctx = assert('add');
    ctx('number', a);
    ctx('number', b);

    return a + b;
  }

  it('should not throw when all parameters are valid', () => {
    expect(greet('Hello', 'Mr.', 'Frodo', 'Baggins')).toBe('Hello, Mr. Frodo Baggins!');
    expect(add(1, 4)).toBe(5);
  });

  it('should throw on the first invalid parameter', () => {
    expect(() => greet('Hello', 13, null, false))
      .toThrow('[Person::greet] Expected type of title to be any of "string", "null", or "undefined". Got "number".');
  });

  it('should support union types', () => {
    expect(greet('Hello', null, 'Bob', 'Smith')).toBe('Hello, Bob Smith!');
  });
});
