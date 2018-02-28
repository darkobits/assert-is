<a href="#top" id="top">
  <img src="https://user-images.githubusercontent.com/441546/36770873-dd84aa14-1c01-11e8-90a8-3da059876af4.png">
</a>
<p align="center">
  <a href="https://www.npmjs.com/package/@darkobits/assert-is"><img src="https://img.shields.io/npm/v/@darkobits/assert-is.svg?style=flat-square"></a>
  <a href="https://travis-ci.org/darkobits/assert-is"><img src="https://img.shields.io/travis/darkobits/assert-is.svg?style=flat-square"></a>
  <a href="https://david-dm.org/darkobits/assert-is"><img src="https://img.shields.io/david/darkobits/assert-is.svg?style=flat-square"></a>
  <a href="https://www.codacy.com/app/darkobits/assert-is"><img src="https://img.shields.io/codacy/coverage/0023b07bb2454f2a8c336f92814f09a0.svg?style=flat-square"></a>
  <a href="https://github.com/conventional-changelog/standard-version"><img src="https://img.shields.io/badge/conventional%20commits-1.0.0-027dc6.svg?style=flat-square"></a>
  <a href="https://github.com/sindresorhus/xo"><img src="https://img.shields.io/badge/code_style-XO-e271a5.svg?style=flat-square"></a>
</p>


A light wrapper around the amazing [**is**](https://github.com/sindresorhus/is) type-checking library by [Sindre Sorhus](https://github.com/sindresorhus) designed to throw nice error messages when type assertions fail. You should familiarize yourself with **is** before using this library.

# Install
```bash
$ npm i @darkobits/assert-is
```

# Use
#### `assertIs(methodOrMethods: string | array, valueOrQualifier: any, value: ?any) : any`

`assertIs` accepts a string (identifying a method from **is**) and a value to test. If **is** returns `true`, the value is returned. If it returns `false`, an error is thrown.

```js
import assertIs from '@darkobits/assert-is';

function add (a, b) {
  assertIs('number', a);
  assertIs('number', b);

  return a + b;
}

add(2, 2)
//=> 4

add(2, 'two')
//=> TypeError('Expected value to be of type "number", got "string".')

// assertIs returns the provided value on success, so we can even get fancy:
const add = (a, b) => assertIs('number', a) + assertIs('number', b);
```

## Qualifiers

Some **is** methods require an additional parameter. For example, [`inRange`](https://github.com/sindresorhus/is#inrangevalue-range) accepts a range (`[min: number, max: number]` or `max: number`) in addition to the value to check. When using these methods with `assertIs`, the qualifier always precedes the value.

```js
import assertIs from '@darkobits/assert-is';

// Assert that a number is positive:

assertIs('inRange', [1, Infinity], 42);
//=> 42

assertIs('inRange', [1, Infinity], NaN);
//=> RangeError('Expected value NaN to be between 1 and Infinity.')
```

## Union Types

`assertIs` can be used to check if a value satisfies at least one of several **is** predicates.

**Note:** Predicates which require qualifiers (like `inRange` and `directInstanceOf`) are not supported when performing union type assertions.

```js
import assertIs from '@darkobits/assert-is';

function greet (name, age) {
  assertIs('string', name);
  assertIs(['string', 'number'], age);

  return `Hello! My name is ${name}, and I am ${age} years old.`;
}

greet('Bob', 36)
//=> 'Hello! My name is Bob, and I am 36 years old.'

greet('Alice', 'forty-three')
//=> 'Hello! My name is Alice, and I am forty-three years old.'

greet('Leeroy', NaN)
//=> TypeError('Expected type of value to be either "string" or "number". Got "NaN".')
```

## Currying

When `assertIs` receives fewer arguments than it needs to perform an assertion, it returns a function which accepts the remaining arguments. This allows for the creation of custom, re-usable assertion functions:

```js
import assertIs from '@darkobits/assert-is';

const assertIsString = assertIs('string');

assertIsString({});
//=> TypeError('Expected value to be of type "string", got "object".')

const assertIsLessThanFive = assertIs('inRange', 5);

const assertIsLessThanFive(10);
//=> RangeError('Expected value 10 to be less than 5.')

class Person { }

const assertIsPerson = assertIs('instanceOf', Person);

assertIsPerson(new Person());
//=> Person

assertIsPerson({});
//=> TypeError('Expected value to be an instance of "Person".')

const assertIsIterable = assertIs(['array', 'map', 'set', 'weakMap', 'weakSet']);

assertIsIterable([1, 2, 3]);
//=> [1, 2, 3]

assertIsIterable(function () {});
//=> TypeError('Expected type of value to be either "Array", "Map", "WeakMap" or "WeakSet". Got "Function".')
```

## Additional Assertions
In addition to the methods provided by **is**, `assertIs` also provides the following assertions:

#### `instanceOf(Ctor: class | function, instance: any)`

Expects a constructor and an object and asserts that the object is an instance of the constructor/class.

```js
import assertIs from '@darkobits/assert-is';

class Person { }

const myPerson = new Person();

assertIs('instanceOf', Person, myPerson);
//=> myPerson

assertIs('instanceOf', Person, 'foo');
//=> TypeError('Expected value to be an instance of "Person", got "string".')
```


#### `subclassOf(SuperclassCtor: class | function, SubclassCtor: class | function)`

Expects two constructors and asserts that the second is a subclass of (re: `extends`) the first.

```js
import assertIs from '@darkobits/assert-is';

class Person { }

class Teacher extends Person { }

assertIs('subclassOf', Person, Teacher);
//=> Teacher

class Animal { }

assertIs('subclassOf', Person, Animal);
//=> TypeError('Expected value to be a subclass of "Person".')
```

## Contexts
`assertIs` provides a fluent API for adding additional contextual information to errors:

```js
import assertIs from '@darkobits/assert-is';
// or:
import { context } from '@darkobits/assert-is';

function add (a, b) {
  const assert = assertIs.context('add');
  // or:
  const assert = context('add');

  // Use assert() just like assertIs():
  assert('number', a);

  // This will throw errors like:
  // TypeError('[add] Expected value to be of type "number", got...');

  // Or, use the 'arg' + 'is' methods to provide additional context about an assertion:
  assert.arg('first argument', a).is('number');

  // This will throw errors like:
  // TypeError('[add] Expected first argument to be of type "number", got...');

  // You can also chain arg/is calls:
  assert.arg('first argument', a).is('number').arg('second argument', b).is('number');

  return a + b;
}
```

The signatures for these methods are:

#### `arg(label: string, value: any) : function`

You may also use `label` (an alias to `arg`) if you prefer. This method always returns an object with `is()`, which accepts the type or types you expect.

#### `is(typeOrTypes: string | array): AssertionContext`

This method always returns the assertion context, meaning you can chain `arg` + `is` calls.

## See Also / Prior Art

- [@sindresorhus/is](https://github.com/sindresorhus/is)

## &nbsp;
<p align="center">
  <br>
  <img width="24" height="24" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>
