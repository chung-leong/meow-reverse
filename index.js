import parser from 'yargs-parser';

const { decamelize } = parser;

export default function meowrev({ input, flags }, options) {
  const argv = [];
  for (const value of input) {
    argv.push(`${value}`);
  }
  for (const [ name, specs ] of Object.entries(options.flags)) {
    const { 
      alias, 
      type, 
      isMultiple = false, 
      isRequired = false, 
    } = specs;
    const defVal = (type === 'boolean') ? specs.default || false : specs.default;
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