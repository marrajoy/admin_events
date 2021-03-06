const pkg = require('./package')

module.exports = {
  env: {
    /*API ENVIRONMENT VARIABLES*/
    VUE_APP_API:
      process.env.VUE_APP_API || 'https://api-staging.cribs.intemp.io',
      // process.env.VUE_APP_API || 'https://intempio-cribs-api-qa-pr-32.herokuapp.com',
    QA_APP:
      process.env.QA_APP || 'https://intempio-support-prod.herokuapp.com/qa-events',
    EMAIL_APP:
      process.env.EMAIL_APP || 'https://intempio-support-prod.herokuapp.com/view-email',

    /*PEOPLEASSIGNED and EVENTTAG ENVIRONMENT VARIABLES*/
    CHECKLIST_ITEMS: process.env.CHECKLIST_ITEMS,
    CLIENT_ITEMS: process.env.CLIENT_ITEMS,
    PRODUCT_ITEMS: process.env.PRODUCT_ITEMS,
    PEOPLE_ASSIGNED_ROLES: process.env.PEOPLE_ASSIGNED_ROLES,

    /*EVENT STATUSES ENVIRONMENT VARIABLES*/
    CLIENT_STATUSES: process.env.CLIENT_STATUSES,
    OPERATION_STATUSES: process.env.OPERATION_STATUSES,
    QA_STATUSES: process.env.QA_STATUSES,
    PRODUCTION_STATUSES: process.env.PRODUCTION_STATUSES
  },

  mode: 'spa',

  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {hid: 'description', name: 'description', content: pkg.description}
    ],
    link: [{rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: {color: '#fff'},

  /*
   ** Global CSS
   */
  css: [
    '~/css/main.scss',
    'assets/styles.scss',
    'vue-multiselect/dist/vue-multiselect.min.css',
    'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: ['~/plugins/auth.js'],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    // Doc: https://buefy.github.io/#/documentation
    // 'nuxt-buefy',
    'bootstrap-vue/nuxt',
    '@nuxtjs/toast',
    'nuxt-material-design-icons'
  ],
  toast: {
    position: 'bottom-center',
    duration: 3000
  },
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  router: {
    middleware: ['routerGuard']
  },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          //loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
