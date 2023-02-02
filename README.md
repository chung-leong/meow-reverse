# meow-reverse ![ci](https://img.shields.io/github/actions/workflow/status/chung-leong/meow-reverse/node.js.yml?branch=main&label=Node.js%20CI&logo=github) ![nycrc config on GitHub](https://img.shields.io/nycrc/chung-leong/meow-reverse)

Generate arguments that would produce the given input and flags in accordance to 
[meow](https://github.com/sindresorhus/meow#readme) options.

![](meowrev.gif)

## Install

```bash
npm install --save-dev meow-reverse
```

## Usage

```js
import meowrev from 'meow-reverse';

const options = {
  importMeta: import.meta,
  flags: {
    rainbow: {
      type: 'boolean',
      alias: 'r'
    }
  }
};
const cli = {
  input: [ 'unicorns' ],
  flags: { rainbow: true },
};

const argv = meowrev(cli, options);
console.log(argv);
```

Output:

```
[ 'unicorns', '--rainbow' ]
```

Since meow does not provide a function that simply parses arguments, `meowparse` is available 
for this purpose: 

```js
import { meowparse } from 'meow-reverse';

const options = {
  importMeta: import.meta,
  flags: {
    rainbow: {
      type: 'boolean',
      alias: 'r'
    }
  }
};

const argv = [ 'unicorns', '-r' ];
const { input, flags } = meowparse(argv, options);
console.log(input, flags);
```

Output:

```
[ 'unicorns' ] { rainbow: true }
```

`meowparse` can only handle common use cases. It does not support, for instance, returning of 
unknown flags.

## Notes

The function will throw when a flag is incompatible with the options given. For instance, any flag 
that has a default value must be present. This applies to all boolean flags, as they have an 
implicit default value of `false`.

Flags are omitted when their values match their default.

Short aliases are employed for multi-value flags. The following:

```js
const options = {
  importMeta: import.meta,
  flags: {
    file: {
      type: 'string',
      alias: 'f'
    }
  }
};
const cli = {
  input: [ 'show' ],
  flags: { file: [ 'meow.gif', 'woof.gif' ] },
};

const argv = meowrev(cli, options);
```

Will produce:

```
[ 'show', '-f', 'meow.gif', '-f', 'woof.gif' ]
```

Use a package like [shell-quote](https://github.com/ljharb/shell-quote#README) to convert the 
array outputted by the function into an actual command-line.
