import { expect } from 'chai';
import meowrev, { meowparse } from '../index.js';

describe(`#meowrev`, function() {
  it('should handle command with zero flags', function() {
    const options = {
      flags: {
        rainbow: {
          type: 'string',
          alias: 'r',          
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: {},
    };
    const argv = meowrev(cli, options);
    expect(argv).to.eql([ 'unicorns' ]);
  })
  it('should handle command with boolean flag', function() {
    const options = {
      flags: {
        rainbow: {
          type: 'boolean',
          alias: 'r',          
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { rainbow: true },
    };
    const argv = meowrev(cli, options);
    expect(argv).to.eql([ 'unicorns', '--rainbow' ]);
  })
  it('should handle command with numeric flag', function() {
    const options = {
      flags: {
        donutCount: {
          type: 'number',
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { donutCount: 8 },
    };
    const argv = meowrev(cli, options);
    expect(argv).to.eql([ 'unicorns', '--donut-count', '8' ]);
  })
  it('should handle command with string flag', function() {
    const options = {
      flags: {
        donutType: {
          type: 'string',
          default: 'strawberry'
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { donutType: 'marmite' },
    };
    const argv = meowrev(cli, options);
    expect(argv).to.eql([ 'unicorns', '--donut-type', 'marmite' ]);
  })
  it('should handle command with multi-variable flag', function() {
    const options = {
      flags: {
        donutType: {
          isMultiple: true,
          type: 'string',
          default: [ 'strawberry', 'cherry' ]
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { donutType: [ 'marmite', 'anchovy' ] },
    };
    const argv = meowrev(cli, options);
    expect(argv).to.eql([ 'unicorns', '--donut-type', 'marmite', '--donut-type', 'anchovy' ]);
  })
  it('should use alias with multi-variable flag', function() {
    const options = {
      flags: {
        donutType: {
          alias: 't',
          isMultiple: true,
          type: 'string',
          default: [ 'strawberry', 'cherry' ]
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { donutType: [ 'marmite', 'anchovy' ] },
    };
    const argv = meowrev(cli, options);
    expect(argv).to.eql([ 'unicorns', '-t', 'marmite', '-t', 'anchovy' ]);
  })
  it('should use first alias in list', function() {
    const options = {
      flags: {
        donutType: {
          alias: [ 't', 'd' ],
          isMultiple: true,
          type: 'string',
          default: [ 'strawberry', 'cherry' ]
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { donutType: [ 'marmite', 'anchovy' ] },
    };
    const argv = meowrev(cli, options);
    expect(argv).to.eql([ 'unicorns', '-t', 'marmite', '-t', 'anchovy' ]);
  })
  it('should omit flag when value matches default', function() {
    const options = {
      flags: {
        donutType: {
          isMultiple: true,
          type: 'string',
          default: [ 'strawberry', 'cherry' ]
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { donutType: [ 'strawberry', 'cherry' ] },
    };
    const argv = meowrev(cli, options);
    expect(argv).to.eql([ 'unicorns' ]);
  })
  it('should omit boolean flag without explicit default value', function() {
    const options = {
      flags: {
        rainbow: {
          type: 'boolean',
          alias: 'r',          
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { rainbow: false },
    };
    const argv = meowrev(cli, options);
    expect(argv).to.eql([ 'unicorns' ]);
  })
  it('should negate boolean flag', function() {
    const options = {
      flags: {
        rainbow: {
          type: 'boolean',
          default: true,
          alias: 'r',          
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { rainbow: false },
    };
    const argv = meowrev(cli, options);
    expect(argv).to.eql([ 'unicorns', '--no-rainbow' ]);
  })
  it('should negate string flag', function() {
    const options = {
      flags: {
        rainbow: {
          type: 'string',
          default: 'hello',
          alias: 'r',          
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { rainbow: false },
    };
    const argv = meowrev(cli, options);
    expect(argv).to.eql([ 'unicorns', '--no-rainbow' ]);
  })
  it('should throw when required flag is missing', function() {
    const options = {
      flags: {
        rainbow: {
          type: 'boolean',
          isRequired: true,
          alias: 'r',          
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: {},
    };
    expect(() => meowrev(cli, options)).to.throw();
  })
  it('should throw when flag with default value is missing', function() {
    const options = {
      flags: {
        rainbow: {
          type: 'number',
          default: 5,
          alias: 'r',          
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: {},
    };
    expect(() => meowrev(cli, options)).to.throw();
  })
  it('should throw when boolean flag is missing due to implicit default value', function() {
    const options = {
      flags: {
        rainbow: {
          type: 'boolean',
          alias: 'r',          
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: {},
    };
    expect(() => meowrev(cli, options)).to.throw();
  })
  it('should throw when value for multi-variable flag is not an array', function() {
    const options = {
      flags: {
        donutType: {
          alias: 't',
          isMultiple: true,
          type: 'string',
          default: [ 'strawberry', 'cherry' ]
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { donutType: 'marmite' },
    };
    expect(() => meowrev(cli, options)).to.throw();
  })
  it('should throw when there is a type mismatch', function() {
    const options = {
      flags: {
        rainbow: {
          type: 'boolean',
          alias: 'r',          
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { rainbow: 5 },
    };
    expect(() => meowrev(cli, options)).to.throw();
  })
  it('should throw when array item does not have the correct type', function() {
    const options = {
      flags: {
        donutType: {
          alias: 't',
          isMultiple: true,
          type: 'string',
          default: [ 'strawberry', 'cherry' ]
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { donutType: [ 'marmite', false ] },
    };
    expect(() => meowrev(cli, options)).to.throw();
  })
  it('should throw when unknown flags are encountered', function() {
    const options = {
      flags: {
        rainbow: {
          type: 'boolean',
          alias: 'r',          
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { rainbow: false, donutType: [ 'marmite', false ] },
    };
    expect(() => meowrev(cli, options)).to.throw();
  })
  it('should allow unknown flags when allowUnknownFlags is set', function() {
    const options = {
      allowUnknownFlags: true,
      flags: {
        rainbow: {
          type: 'boolean',
          alias: 'r',          
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { rainbow: false, donutType: 'marmite' },
    };
    const argv = meowrev(cli, options);
    expect(argv).to.eql([ 'unicorns', '--donut-type', 'marmite' ]);
  })
  it('should throw when unknown flag is an array', function() {
    const options = {
      allowUnknownFlags: true,
      flags: {
        rainbow: {
          type: 'boolean',
          alias: 'r',          
        }
      }
    };
    const cli = {
      input: [ 'unicorns' ],
      flags: { rainbow: false, donutType: [ 'marmite' ] },
    };
    expect(() => meowrev(cli, options)).to.throw();
  })
})

describe('#meowparse', function() {
  it('should parse command with no flag', function() {
    const options = {
      flags: {
        rainbow: {
          type: 'string',
          alias: 'r',          
        }
      }
    };
    const argv = [ 'unicorns' ];
    const { input, flags } = meowparse(argv, options);
    expect(input).to.eql([ 'unicorns' ]);
    expect(flags).to.eql({});
  })

  it('should parse command with boolean flag', function() {
    const options = {
      flags: {
        rainbow: {
          type: 'boolean',
          alias: 'r',          
        }
      }
    };
    const argv = [ 'unicorns', '--rainbow' ];
    const { flags } = meowparse(argv, options);
    expect(flags).to.eql({ rainbow: true });
  })
  it('should parse command with numeric flag', function() {
    const options = {
      flags: {
        donutCount: {
          type: 'number',
        }
      }
    };
    const argv = [ 'unicorns', '--donut-count', '8' ];
    const { flags } = meowparse(argv, options);
    expect(flags).to.eql({ donutCount: 8 });
  })
  it('should parse command with string flag', function() {
    const options = {
      flags: {
        donutType: {
          type: 'string',
          default: 'strawberry'
        }
      }
    };
    const argv = [ 'unicorns', '--donut-type', 'marmite' ];
    const { flags } = meowparse(argv, options);
    expect(flags).to.eql({ donutType: 'marmite' });
  })
  it('should parse command with multi-variable flag', function() {
    const options = {
      flags: {
        donutType: {
          isMultiple: true,
          type: 'string',
          default: [ 'strawberry', 'cherry' ]
        }
      }
    };
    const argv = [ 'unicorns', '--donut-type', 'marmite', '--donut-type', 'anchovy' ];
    const { flags } = meowparse(argv, options);
    expect(flags).to.eql({ donutType: [ 'marmite', 'anchovy' ] });
  })
  it('should parse command with multi-variable flag with no type', function() {
    const options = {
      flags: {
        donutType: {
          isMultiple: true,
        }
      }
    };
    const argv = [ 'unicorns', '--donut-type', 'marmite', '--donut-type', 'anchovy' ];
    const { flags } = meowparse(argv, options);
    expect(flags).to.eql({ donutType: [ 'marmite', 'anchovy' ] });
  })
  it('should parse command using aliases', function() {
    const options = {
      flags: {
        donutType: {
          alias: [ 't', 'd' ],
          isMultiple: true,
          type: 'string',
          default: [ 'strawberry', 'cherry' ]
        }
      }
    };
    const argv = [ 'unicorns', '-t', 'marmite', '-d', 'anchovy' ];
    const { flags } = meowparse(argv, options);
    expect(flags).to.eql({ donutType: [ 'marmite', 'anchovy' ] });
  })
  it('should throw when a flag is specified more than once', function() {
    const options = {
      flags: {
        donutType: {
          isMultiple: false,
          type: 'string',
          default: 'strawberry'
        }
      }
    };
    const argv = [ 'unicorns', '--donut-type', 'marmite', '--donut-type', 'anchovy' ];
    expect(() => meowparse(argv, options)).to.throw();
  })
  it('should throw when a required flag is missing', function() {
    const options = {
      flags: {
        donutType: {
          isRequired: true,
          type: 'string',
        }
      }
    };
    const argv = [ 'unicorns' ];
    expect(() => meowparse(argv, options)).to.throw();
  })
})