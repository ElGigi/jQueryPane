import babel from 'rollup-plugin-babel'

module.exports = {
  input: 'src/js/Pane.js',
  external: ['jquery'],
  plugins: [
    babel({
            exclude: 'node_modules/**',
            //externalHelpersWhitelist: [
            //  'defineProperties',
            //  'createClass',
            //  'inheritsLoose',
            //  'defineProperty',
            //  'objectSpread'
            //]
          })
  ],
  output: {
    format: 'umd',
    name: 'Pane',
    sourcemap: true,
    globals: {
      jquery: 'jQuery'
    },
    file: 'dist/js/jquery-pane.js'
  }
}