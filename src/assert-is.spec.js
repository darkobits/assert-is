import assertIs from './assert-is';


describe('basic functionality', () => {
  it('should throw an error if the provided method does not exist', () => {
    expect(() => {
      assertIs('fleeb', 17);
    }).toThrow(/Assertion type "fleeb" is invalid./);
  });

  it('should throw an error if the provided value does not satisfy the predicate', () => {
    expect(() => assertIs('directInstanceOf', Error, null))
      .toThrow(/Expected value to be a direct instance of "Error", got "null"./);

    class Foo { }

    expect(() => assertIs('directInstanceOf', Error)(new Foo()))
      .toThrow(/Expected value to be a direct instance of "Error", got "Foo"./);

    expect(() => assertIs('directInstanceOf', Error)(undefined))
      .toThrow(/Expected value to be a direct instance of "Error", got "undefined"./);

    expect(() => assertIs('directInstanceOf', Array)(() => {}))
      .toThrow(/Expected value to be a direct instance of "Array", got "Function"./);

    expect(() => assertIs('inRange', 10, 50))
      .toThrow(/Expected value 50 to be less than or equal to 10./);

    expect(() => assertIs('inRange', [10, 20], 50))
      .toThrow(/Expected value 50 to be between 10 and 20./);

    expect(() => assertIs('inRange')(10)(50))
      .toThrow(/Expected value 50 to be less than or equal to 10./);

    expect(() => assertIs('inRange', [10, 20])(50))
      .toThrow(/Expected value 50 to be between 10 and 20./);

    expect(() => assertIs('inRange', [10, 20])(50))
      .toThrow(RangeError);

    expect(() => assertIs('plainObject', () => {}))
      .toThrow(/Expected value to be of type "plain object", got "Function"./);

    expect(() => assertIs('truthy', undefined))
      .toThrow(/Expected value to be truthy, got "undefined"./);

    expect(() => assertIs('falsy')({foo: 'bar'}))
      .toThrow(/Expected value to be falsy, got "Object"./);

    expect(() => assertIs('all', 1, 2))
      .toThrow(/Assertions using "all" are not supported./);

    expect(() => assertIs('any', 1, 2))
      .toThrow(/Assertions using "any" are not supported./);
  });

  it('should return the provided value if it satisfied the predicate', () => {
    expect(assertIs('directInstanceOf', Error, new Error())).toBeInstanceOf(Error);

    expect(assertIs('directInstanceOf', Map)(new Map())).toBeInstanceOf(Map);

    expect(assertIs('inRange', [1, Infinity])(42)).toBe(42);

    expect(assertIs('inRange', 10, 5)).toBe(5);

    expect(assertIs('inRange', [10, 20], 15)).toBe(15);

    expect(assertIs('inRange')(10)(5)).toBe(5);

    expect(assertIs('inRange', [10, 20])(15)).toBe(15);

    expect(assertIs('plainObject', {})).toEqual({});

    expect(assertIs('truthy')(42)).toBe(42);

    expect(assertIs('falsy', null)).toBe(null);
  });
});


describe('union types', () => {
  it('should throw an error if the provided value does not satisfy the predicate', () => {
    expect(() => assertIs(['truthy', 'string'], null))
      .toThrow(/Expected type of value to be either "truthy" or "string". Got "null"./);

    expect(() => assertIs(['symbol', 'function'])('foo'))
      .toThrow(/Expected type of value to be either "Symbol" or "Function". Got "string"./);

    expect(() => assertIs(['regExp', 'date'], []))
      .toThrow(/Expected type of value to be either "RegExp" or "Date". Got "Array"./);

    expect(() => assertIs(['number', 'nan'], 'three'))
      .toThrow(/Expected type of value to be either "number" or "NaN". Got "string"./);

    expect(() => assertIs(['integer', 'falsy'])(3.14))
      .toThrow(/Expected type of value to be either "integer" or "falsy". Got "number"./);

    expect(() => assertIs(['null', 'undefined'], false))
      .toThrow(/Expected type of value to be either "null" or "undefined". Got "boolean"./);

    expect(() => assertIs(['plainObject', 'array'], new Set()))
      .toThrow(/Expected type of value to be either "plain object" or "Array". Got "Set"./);

    expect(() => assertIs(['truthy', 'function'], undefined))
      .toThrow(/Expected type of value to be either "truthy" or "Function". Got "undefined"./);

    expect(() => assertIs(['directInstanceOf', 'plainObject'], Error, {}))
      .toThrow(/Assertions using "directInstanceOf" are not supported./);

    expect(() => assertIs(['inRange', 'plainObject'], [10, 20], 5))
      .toThrow(/Assertions using "inRange" are not supported./);
  });

  it('should return the provided value if it satisfied the predicate', () => {
    expect(assertIs(['number', 'string'], 'four')).toBe('four');

    expect(assertIs(['plainObject', 'function'], {})).toEqual({});

    expect(assertIs(['truthy'])(42)).toBe(42);

    expect(assertIs(['falsy', 'undefined'], 0)).toBe(0);
  });
});


describe('custom predicates', () => {
  class Parent { }

  class Child extends Parent { }

  class Orphan { }

  describe('subclassOf', () => {
    it('should throw an error if the two classes are not related', () => {
      expect(() => assertIs('subclassOf', Parent)(Child)).not.toThrow();
      expect(() => assertIs('subclassOf', Parent, Orphan))
        .toThrow('Expected value to be a subclass of "Parent".');
    });
  });

  describe('instanceOf', () => {
    it('should throw an error if the two classes are not related', () => {
      expect(() => assertIs('instanceOf', Parent, new Child())).not.toThrow();
      expect(() => assertIs('instanceOf')(Parent)(new Orphan()))
        .toThrow('Expected value to be an instance of "Parent".');
    });
  });
});


describe('contexts', () => {
  function greet(salutation, title, first, last) {
    assertIs.context('Person::greet')
      .arg('salutation', salutation).is('string')
      .arg('title', title).is(['string', 'nullOrUndefined'])
      .arg('first name', first).is('string')
      .label('last name', last).is('string');

    return `${salutation}, ${title ? `${title} ` : ''}${first} ${last}!`;
  }

  function add(a, b) {
    const ctx = assertIs.context('add');
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
      .toThrow('[Person::greet] Expected type of title to be either "string", "null", or "undefined". Got "number".');

    expect(() => add('one', 2))
      .toThrow('[add] Expected value to be of type "number", got "string".');
  });

  it('should support union types', () => {
    expect(greet('Hello', null, 'Bob', 'Smith')).toBe('Hello, Bob Smith!');
  });

  it('should support qualifiers', () => {
    expect(() => assertIs.context('qualifier').arg('number', 150).is('inRange', [1, 100]))
      .toThrow('[qualifier] Expected number 150 to be between 1 and 100.');
  });
});
