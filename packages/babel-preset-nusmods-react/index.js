const plugins = [
  // class { handleClick = () => { } }
  require.resolve('babel-plugin-transform-class-properties'),
  // { ...todo, completed: true }
  [
    require.resolve('babel-plugin-transform-object-rest-spread'),
    {
      useBuiltIns: true,
    },
  ],
  // Optimize lodash
  require.resolve('babel-plugin-lodash'),
];

// This is similar to how `env` works in Babel:
// https://babeljs.io/docs/usage/babelrc/#env-option
// We are not using `env` because it’s ignored in versions > babel-core@6.10.4:
// https://github.com/babel/babel/issues/4539
// https://github.com/facebookincubator/create-react-app/issues/720
// It’s also nice that we can enforce `NODE_ENV` being specified.
const env = process.env.BABEL_ENV || process.env.NODE_ENV;
if (env !== 'development' && env !== 'test' && env !== 'production') {
  throw new Error(
    `${'Using `babel-preset-nusmods-react` requires that you specify `NODE_ENV` or ' +
      '`BABEL_ENV` environment variables. Valid values are "development", ' +
      '"test", and "production". Instead, received: '}${JSON.stringify(env)}.`,
  );
}

if (env === 'test') {
  module.exports = {
    presets: [
      // ES features necessary for user's Node version
      [
        require.resolve('babel-preset-env'),
        {
          targets: {
            node: 'current',
          },
        },
      ],
      // JSX, Flow
      require.resolve('babel-preset-react'),
    ],
    plugins: plugins.concat([
      // Compiles import() to a deferred require()
      require.resolve('babel-plugin-dynamic-import-node'),
    ]),
  };
} else if (env === 'development') {
  module.exports = {
    presets: [
      // Latest stable ECMAScript features
      [
        require.resolve('babel-preset-env'),
        {
          targets: {
            browsers: ['last 2 versions', 'iOS >= 9', 'Safari >= 10', 'not ie <= 11'],
            // We currently minify with uglify
            // Remove after https://github.com/mishoo/UglifyJS2/issues/448
            uglify: true,
          },
          // Enable tree-shaking for webpack
          modules: false,
          useBuiltIns: true,
        },
      ],
      // JSX, Flow
      require.resolve('babel-preset-react'),
    ],
    plugins: plugins.concat([
      // Adds syntax support for import()
      require.resolve('babel-plugin-syntax-dynamic-import'),
      // Support hot reloading
      require.resolve('react-hot-loader/babel'),
    ]),
  };
} else {
  module.exports = {
    presets: [
      // Latest stable ECMAScript features
      [
        require.resolve('babel-preset-env'),
        {
          targets: {
            browsers: ['last 2 versions', 'iOS >= 9', 'Safari >= 10', 'not ie <= 11'],
            // We currently minify with uglify
            // Remove after https://github.com/mishoo/UglifyJS2/issues/448
            uglify: true,
          },
          // Enable tree-shaking for webpack
          modules: false,
          useBuiltIns: true,
        },
      ],
      // JSX, Flow
      require.resolve('babel-preset-react'),
      // Optimize react
      require.resolve('react-optimize'),
    ],
    plugins: plugins.concat([
      // Adds syntax support for import()
      require.resolve('babel-plugin-syntax-dynamic-import'),
    ]),
  };
}
