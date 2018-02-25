import assert from './context';

describe('contexts', () => {
  function greet(salutation, title, first, last) {
    assert('Person::greet')
      .arg('salutation').is('string', salutation)
      .arg('title').is(['string', 'nullOrUndefined'], title)
      .arg('first name').is('string', first)
      .label('last name').is('string', last);

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
      .toThrow('[Person::greet] Expected title to be any of "string" or "null" or "undefined", got "number".');
  });

  it('should support union types', () => {
    expect(greet('Hello', null, 'Bob', 'Smith')).toBe('Hello, Bob Smith!');
  });
});
