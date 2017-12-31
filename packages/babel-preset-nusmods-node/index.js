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
];

module.exports = {
  presets: [
    // ES features necessary for user's Node version
    [
      require('babel-preset-env').default,
      {
        targets: {
          node: 'current',
          useBuiltIns: true,
        },
      },
    ],
  ],
  plugins,
};
