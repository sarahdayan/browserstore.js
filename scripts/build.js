const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const minify = require('rollup-plugin-babel-minify')

const pluginSetups = {
  default: [
    babel({
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              browsers: ['last 2 versions']
            }
          }
        ]
      ],
      exclude: 'node_modules/**',
      babelrc: false
    })
  ],
  minify: [
    minify({
      comments: false
    })
  ]
}

const modules = [
  {
    path: 'src/browserstore.js',
    plugins: [...pluginSetups.default],
    dest: 'browserstore',
    builds: ['cjs', 'umd', 'amd', 'es']
  },
  {
    path: 'src/create_store.js',
    plugins: [...pluginSetups.default],
    dest: 'lite/create_store',
    builds: ['umd', 'amd']
  },
  {
    path: 'src/multi_store.js',
    plugins: [...pluginSetups.default],
    dest: 'lite/multi_store',
    builds: ['umd', 'amd']
  },
  {
    path: 'src/adapters/local_storage_adapter.js',
    plugins: [...pluginSetups.default],
    dest: 'adapters/local_storage_adapter',
    builds: ['cjs', 'umd', 'amd', 'es']
  },
  {
    path: 'src/adapters/session_storage_adapter.js',
    plugins: [...pluginSetups.default],
    dest: 'adapters/session_storage_adapter',
    builds: ['cjs', 'umd', 'amd', 'es']
  }
]

const processes = [
  {
    plugins: [],
    suffix: ''
  },
  {
    plugins: pluginSetups.minify,
    suffix: '.min'
  }
]

const outputs = [
  {
    format: 'cjs',
    folder: 'cjs'
  },
  {
    format: 'umd',
    folder: 'umd'
  },
  {
    format: 'amd',
    folder: 'amd'
  },
  {
    format: 'es',
    folder: 'esm'
  }
]

modules.forEach(({ path, builds, plugins: componentPlugins, dest }) => {
  processes.forEach(({ plugins: processPlugins, suffix }) => {
    ;(async () => {
      const bundle = await rollup.rollup({
        input: path,
        plugins: [...componentPlugins, ...processPlugins]
      })
      buildOutputs(bundle, builds, dest + suffix)
    })()
  })
})

const buildOutputs = (bundle, builds, path = '') => {
  outputs.forEach(({ folder, format }) => {
    if (builds.includes(format)) {
      bundle.write({
        file: `build/${folder}/${path}.js`,
        format,
        name: 'browserstore'
      })
    }
  })
}
