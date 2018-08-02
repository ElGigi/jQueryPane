import babel from 'rollup-plugin-babel'

const path = require('path');
const pkg = require(path.resolve(__dirname, 'package.json'))

module.exports = {
  input: 'src/js/Pane.js',
  external: ['jquery'],
  plugins: [
    babel({
            exclude: 'node_modules/**'
          })
  ],
  output: {
    banner: `/*!
  * jQuery Pane v${pkg.version} (${pkg.homepage})
  * Copyright 2018 ${pkg.author}
  * Licensed under MIT (https://github.com/ElGigi/jQueryPane/blob/master/LICENSE)
  */`,
    format: 'umd',
    name: 'Pane',
    sourcemap: true,
    globals: {
      jquery: 'jQuery'
    },
    file: 'dist/js/jquery-pane.js',
  }
}