import AnalyticsPlugin from './AnalyticsPlugin'
import GAModule from './modules/ga-module'
import * as Utils from './utils'
import * as types from './analytics_types'

/**
 * Installation procedure
 *
 * @param Vue
 * @param initConf
 */
const install = function (Vue, initConf = {}) {
  // init Google Analytics
  // We created all the modules that app will use
  Vue.modulesEnabled = []
  for (let key in initConf.modules) {
    let module
    switch (key) {
      case types.MODULE_GA:
        module = new GAModule()
        module.init(initConf.modules[key])
        break;
      default:
        break;
    }
    if (module) {
      Vue.modulesEnabled.push(module)
    }
  }
  // Handle vue-router if defined
  if (initConf.params && initConf.params.vueRouter) {
    initVueRouterGuard(Vue, initConf.params.vueRouter, initConf.params.ignoredViews)
  }

  // Add to vue prototype and also from globals
  Vue.prototype.$multianalytics = Vue.prototype.$ma = Vue.analytics = new AnalyticsPlugin(Vue.modulesEnabled)

}

/**
 * Init the router guard.
 *
 * @param Vue - The Vue instance
 * @param vueRouter - The Vue router instance to attach guard
 * @param {string[]} ignoredViews - An array of route name to ignore
 *
 * @returns {string[]} The ignored routes names formalized.
 */
const initVueRouterGuard = function (Vue, vueRouter, ignoredViews) {
  // Flatten routes name
  if (ignoredViews) {
    ignoredViews = ignoredViews.map(view => view.toLowerCase())
  }

  vueRouter.afterEach(to => {
    // Ignore some routes
    if (ignoredViews && ignoredViews.indexOf(to.name.toLowerCase()) !== -1) {
      return
    }
    // Dispatch vue event using meta analytics value if defined otherwise fallback to route name
    Vue.analytics.trackView(to.meta.analytics || to.name)
  })

  return ignoredViews;
}

// Export module
export default { install }
