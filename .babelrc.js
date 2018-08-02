module.exports = {
  presets: [
    [
      '@babel/env',
      {
        modules: false
      }
    ]
  ],
  plugins: [
    "external-helpers",
    "@babel/proposal-object-rest-spread"
  ]
}