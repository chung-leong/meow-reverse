import parse from 'yargs-parser';
import buildOptions from 'minimist-options';

const { decamelize } = parse;

export default function meowrev({ input, flags }, options) {
  const argv = [];
  for (const value of input) {
    argv.push(`${value}`);
  }
  const booleanDefault = options.booleanDefault || false;
  for (const [ name, specs ] of Object.entries(options.flags)) {
    const { 
      type, 
      isMultiple = false, 
      isRequired = false, 
    } = specs;
    const alias = Array.isArray(specs.alias) ? specs.alias[0] : specs.alias;
    const defVal = (type === 'boolean') ? specs.default || booleanDefault : specs.default;
    const value = flags[name];
    if (value == null) {
      // enforce requirement
      if (isRequired) {
        throw new Error(`Missing required flag: ${name}`);
      } else if (defVal !== undefined) {
        throw new Error(`Cannot omit flag with default value: ${name}`);
      }
      continue;
    }    
    // don't add it if it's the default
    if (defVal !== undefined && JSON.stringify(defVal) === JSON.stringify(value)) {
      continue;
    }
    if (isMultiple) {
      if (!Array.isArray(value)) {
        throw new TypeError(`Invalid value for flag accepting multiple values: ${name}`);
      }      
      for (const item of value) {
        if (typeof(item) !== type) {
          throw new TypeError(`Invalid type for flag: ${name}`);
        }
        // use short alias if there's one
        argv.push(alias ? `-${alias}` : `--${decamelize(name)}`, `${item}`);
      }
    } else {
      if (typeof(value) !== type) {
        if (value === false) {
          argv.push(`--no-${decamelize(name)}`);
        } else {
          throw new TypeError(`Invalid type for flag: ${name}`);
        }
      } else {
        if (type === 'boolean') {
          argv.push(value ? `--${decamelize(name)}` : `--no-${decamelize(name)}`);
        } else {
          argv.push(`--${decamelize(name)}`, `${value}`);
        }  
      }
    }
  }
  for (const [ name, value ] of Object.entries(flags)) {
    if (!(name in options.flags)) {
      // throw if unknown flags aren't allowed
      if (!options.allowUnknownFlags) {
        throw new Error(`Unknown flag: ${name}`);
      }
      if (Array.isArray(value)) {
        throw new Error(`Unknown flag cannot have multiple values: ${name}`);
      }
      argv.push(`--${decamelize(name)}`, `${value}`);
    }
  }
  return argv;
}

export function meowparse(argv, options) {
  const parserFlags = {
    arguments: 'string',
  };
  const booleanDefault = options.booleanDefault || false;
  for (const [ name, specs ] of Object.entries(options.flags)) {
    const { 
      alias, 
      type, 
      isMultiple = false, 
    } = specs;
    const defVal = (type === 'boolean') ? specs.default || booleanDefault : specs.default;
    const flag = { alias };
    if (isMultiple) {
      flag.type = (type) ? `${type}-array` : 'array';
      flag.default = defVal || [];
    } else {
      flag.type = type;
      if (defVal !== undefined) {
        flag.default = defVal;
      }
    }
    const flagKey = decamelize(name);
    parserFlags[flagKey] = flag;
  }
  const parserOptions = buildOptions(parserFlags);
  const { _: input, ...flagValues } = parse(argv, parserOptions);
  const flags = {};
  for (const [ name, specs ] of Object.entries(options.flags)) {
    const { 
      isRequired = false, 
      isMultiple = false,
    } = specs;
    const value = flagValues[name];
    if (value !== undefined) {
      if (Array.isArray(value) && !isMultiple) {
        throw new Error(`--${decamelize(name)} can only be specified once`);
      } 
      flags[name] = value;
    } else {
      if (isRequired) {
        throw new Error(`--${decamelize(name)} is required`);
      }
    }
  }
  return { input, flags };
} 

