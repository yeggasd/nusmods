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
      require.resolve('babel-preset-env'),
      {
        targets: {
          node: 'current',
          useBuiltIns: true,
        },
      },
    ],
    require.resolve('babel-preset-flow'),
  ],
  plugins,
};
