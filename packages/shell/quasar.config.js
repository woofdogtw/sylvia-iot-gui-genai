import { configure } from 'quasar/wrappers'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

export default configure(function (/* ctx */) {
  return {
    boot: [
      'i18n',
      'axios',
      'plugins',
    ],

    css: [
      'app.scss',
    ],

    extras: [
      'material-icons',
    ],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },
      vueRouterMode: 'hash',
      env: {
        VITE_APP_NAME: pkg.productName || pkg.name,
        VITE_APP_VERSION: pkg.version,
      },
    },

    devServer: {
      open: true,
    },

    framework: {
      plugins: [
        'Dark',
        'LocalStorage',
        'Notify',
      ],
    },

    animations: [],

    ssr: {
      pwa: false,
    },

    pwa: {
      workboxMode: 'GenerateSW',
    },

    capacitor: {
      hideSplashscreen: true,
    },

    electron: {
      preloadScripts: ['electron-preload'],
      inspectPort: 5858,
      bundler: 'packager',
    },

    bex: {
      contentScripts: ['my-content-script'],
    },
  }
})
