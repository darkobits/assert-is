import assertIs from './assert-is';


describe('#assertIs', () => {
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

    expect(assertIs('inRange', 10, 5)).toBe(5);

    expect(assertIs('inRange', [10, 20], 15)).toBe(15);

    expect(assertIs('inRange')(10)(5)).toBe(5);

    expect(assertIs('inRange', [10, 20])(15)).toBe(15);

    expect(assertIs('plainObject', {})).toEqual({});

    expect(assertIs('truthy')(42)).toBe(42);

    expect(assertIs('falsy', null)).toBe(null);
  });

  describe('union types', () => {
    it('should throw an error if the provided value does not satisfy the predicate', () => {
      expect(() => assertIs(['truthy', 'string'], null))
        .toThrow(/Expected value to be any of "truthy" or "string", got "null"./);

      expect(() => assertIs(['symbol', 'function'])('foo'))
        .toThrow(/Expected value to be any of "Symbol" or "Function", got "string"./);

      expect(() => assertIs(['regExp', 'date'], []))
        .toThrow(/Expected value to be any of "RegExp" or "Date", got "Array"./);

      expect(() => assertIs(['number', 'nan'], 'three'))
        .toThrow(/Expected value to be any of "number" or "NaN", got "string"./);

      expect(() => assertIs(['integer', 'falsy'])(3.14))
        .toThrow(/Expected value to be any of "integer" or "falsy", got "number"./);

      expect(() => assertIs(['null', 'undefined'], false))
        .toThrow(/Expected value to be any of "null" or "undefined", got "boolean"./);

      expect(() => assertIs(['plainObject', 'array'], new Set()))
        .toThrow(/Expected value to be any of "plain object" or "array", got "Set"./);

      expect(() => assertIs(['truthy', 'function'], undefined))
        .toThrow(/Expected value to be any of "truthy" or "Function", got "undefined"./);

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
});
