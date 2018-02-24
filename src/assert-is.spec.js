import assertIs from './assert-is';


describe('#assertIs', () => {
  it('should throw an error if the provided method does not exist', () => {
    expect(() => {
      assertIs('fleeb', 17);
    }).toThrow(/Assertion type "fleeb" is invalid./);
  });

  it('should throw an error if the provided value does not satisfy the predicate', () => {
    expect(() => assertIs('directInstanceOf', Error, new Map()))
      .toThrow(/Expected value to be a direct instance of "Error", got "Map"./);

    expect(() => assertIs('directInstanceOf', Array)(() => {}))
      .toThrow(/Expected value to be a direct instance of "Array", got "Function"./);

    expect(() => assertIs('inRange', 10, 50))
      .toThrow(/Expected value 50 to be less than or equal to 10./);

    expect(() => assertIs('inRange', [10, 20], 50))
      .toThrow(/Expected value 50 to be between 10 and 20./);

    expect(() => assertIs('inRange', 10)(50))
      .toThrow(/Expected value 50 to be less than or equal to 10./);

    expect(() => assertIs('inRange', [10, 20])(50))
      .toThrow(/Expected value 50 to be between 10 and 20./);

    expect(() => assertIs('plainObject', () => {}))
      .toThrow(/Expected value to be of type "plainObject", got "Function"./);

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
});
