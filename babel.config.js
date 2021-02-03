module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        corejs: '3',
        exclude: ['transform-async-to-generator'],
        modules: false,
        useBuiltIns: 'entry',
      },
    ],
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    'syntax-trailing-function-commas',
    [
      '@babel/plugin-transform-regenerator',
      {
        asyncGenerators: false,
        generators: true,
        async: false,
      },
    ],
    [
      'module:fast-async',
      {
        useRuntimeModule: true,
      },
    ],
  ],
};
