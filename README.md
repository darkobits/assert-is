# assert-is

[![][npm-img]][npm-url] [![][travis-img]][travis-url] [![][david-img]][david-url] [![][codacy-img]][codacy-url] [![][cc-img]][cc-url] [![][xo-img]][xo-url]

A light wrapper around the amazing [**is**](https://github.com/sindresorhus/is) type-checking library by [Sindre Sorhus](https://github.com/sindresorhus) designed to throw nice error messages when assertions fail. You should familiarize yourself with **is** before using this library.

# Install

```bash
$ npm i @darkobits/assert-is
```

# Use

### `default(method: string, valueOrQualifier: any, value: ?any) : any`

This package's default export is a function which accepts as its first parameter a valid method from **is** and then either a value or a qualifier and a value. Qualifiers are used on certain **is** methods such as [`inRange`](https://github.com/sindresorhus/is#inrangevalue-range). Unlike the method signatues of **is**, this library always expects the value to be the _last_ parameter. This is done to make currying easier.

**Note:** The methods `any` and `all` are not supported by `assertIs`. However, union types can be handled with `assertAny` (see below).

```js
import assertIs from '@darkobits/assert-is';

function add (a, b) {
  assertIs('number', a);
  assertIs('number', b);

  return a + b;
}

add(2, 2) //=> 4

add(2, 'two') //=> TypeError('Expected value to be of type "number", got "string".')

// assertIs returns the provided value on success, so we can even get fancy:
const add = (a, b) => assertIs('number', a) + assertIs('number', b);
```

## Union Types

`assertAny` can be used to check if a value satisfies one of any **is** predicates.

**Note:** Predicates which require qualifiers (like `inRange` and `directInstanceOf`) are not supported with `assertAny`.

```js
import assertIs, {assertAny} from '@darkobits/assert-is';

// Easily create reusable assertions for specific types:
const assertIsString = assertIs('string');

function greet (name, age) {
  assertIsString(name);
  assertAny(['string', 'number'], age);

  return `Hello! My name is ${name}, and I am ${age} years old.`;
}

greet('Bob', 36) //=> 'Hello! My name is Bob, and I am 36 years old.'

greet('Alice', 'forty-three') //=> 'Hello! My name is Alice, and I am forty-three years old.'

greet('Leeroy', NaN) //=> TypeError('Expected value to be one of "string" or "number", got "nan".')
```

## &nbsp;
<p align="center">
  <br>
  <img width="24" height="24" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>

[npm-img]: https://img.shields.io/npm/v/@darkobits/assert-is.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@darkobits/assert-is

[travis-img]: https://img.shields.io/travis/darkobits/assert-is.svg?style=flat-square
[travis-url]: https://travis-ci.org/darkobits/assert-is

[david-img]: https://img.shields.io/david/darkobits/assert-is.svg?style=flat-square
[david-url]: https://david-dm.org/darkobits/assert-is

[codacy-img]: https://img.shields.io/codacy/coverage/0023b07bb2454f2a8c336f92814f09a0.svg?style=flat-square
[codacy-url]: https://www.codacy.com/app/darkobits/private-data

[cc-img]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square
[cc-url]: https://github.com/conventional-changelog/standard-version

[xo-img]: https://img.shields.io/badge/code_style-XO-e271a5.svg?style=flat-square
[xo-url]: https://github.com/sindresorhus/xo