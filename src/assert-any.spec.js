import assertAny from './assert-any';

describe('#assertAny', () => {
  it('should throw an error if the provided value does not satisfy the predicate', () => {
    expect(() => assertAny(['truthy', 'string'], null))
      .toThrow(/Expected value to be any of "truthy" or "string", got "null"./);

    expect(() => assertAny(['symbol', 'function'])('foo'))
      .toThrow(/Expected value to be any of "symbol" or "function", got "string"./);

    expect(() => assertAny(['regExp', 'date'], []))
      .toThrow(/Expected value to be any of "regExp" or "date", got "Array"./);

    expect(() => assertAny(['number', 'nan'], 'three'))
      .toThrow(/Expected value to be any of "number" or "nan", got "string"./);

    expect(() => assertAny(['integer', 'falsy'])(3.14))
      .toThrow(/Expected value to be any of "integer" or "falsy", got "number"./);

    expect(() => assertAny(['null', 'undefined'], false))
      .toThrow(/Expected value to be any of "null" or "undefined", got "boolean"./);

    expect(() => assertAny(['plainObject', 'array'], new Set()))
      .toThrow(/Expected value to be any of "plainObject" or "array", got "Set"./);

    expect(() => assertAny(['truthy', 'function'], undefined))
      .toThrow(/Expected value to be any of "truthy" or "function", got "undefined"./);

    expect(() => assertAny(['directInstanceOf', 'plainObject'], Error, {}))
      .toThrow(/Assertions using "directInstanceOf" are not supported./);

    expect(() => assertAny(['inRange', 'plainObject'], [10, 20], 5))
      .toThrow(/Assertions using "inRange" are not supported./);
  });

  it('should return the provided value if it satisfied the predicate', () => {
    expect(assertAny(['number', 'string'], 'four')).toBe('four');

    expect(assertAny(['plainObject', 'function'], {})).toEqual({});

    expect(assertAny(['truthy'])(42)).toBe(42);

    expect(assertAny(['falsy', 'undefined'], 0)).toBe(0);
  });
});
