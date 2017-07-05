const rollup = require('rollup')
const pkg = require('../package.json')
const del = require('del')

const sourcemaps = require('rollup-plugin-sourcemaps')
const babel = require('rollup-plugin-babel')
const builtins = require('rollup-plugin-node-builtins')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babili = require('rollup-plugin-babili')

const bundles = [
  {
    format: 'cjs',
    dest: pkg.main,
    plugins: [
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        plugins: [
          'transform-class-properties',
          'external-helpers',
        ],
        presets: [
          ['es2015', {modules: false}]
        ],
      }),
    ],
  },
  {
    format: 'es',
    dest: pkg.module,
    plugins: [
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        plugins: [
          'transform-class-properties',
          'external-helpers',
        ],
      }),
    ],
  },
]

const prePlugins = [
  sourcemaps(),
]

const postPlugins = [
  builtins(),
  nodeResolve(),
  commonjs(),
  babili({comments: false}),
]

let promise = Promise.resolve()
promise = promise.then(() => del(['dist/']))

function supressWarnings(supressed, cb) {
  return function (warning) {
    if (supressed.indexOf(warning.code) === -1) {
      if (typeof cb === 'function') cb(warning)
      else console.log(warning.message)
    }
  }
}

function logWarningCodes(warning) {
  console.log(warning.code)
  console.log(warning.message)
}

const externalDependencides = Object.keys(pkg.dependencies)
  .concat(Object.keys(pkg.peerDependencies))
  .concat([
    'react-dom/lib/ReactUpdates',
    'react-dom/lib/ReactMultiChild'
  ])

for (const config of bundles) {
  promise = promise.then(() => rollup.rollup({
    entry: 'lib/ReactCanvas.js',
    external: externalDependencides,
    plugins: prePlugins
      .concat(config.plugins)
      .concat(postPlugins),
    onwarn: supressWarnings(['MISSING_GLOBAL_NAME'], logWarningCodes),
  }))
  .then(bundle => bundle.write({
    dest: config.dest,
    format: config.format,
    moduleName: config.moduleName,
    sourceMap: true,
  }))
}

promise.catch((err) => console.error(err.stack))
