import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes.js'
import { useAuthStore } from 'stores/auth-store.js'

export default route(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach((to) => {
    if (to.meta.requiresAuth) {
      const authStore = useAuthStore(store)
      if (!authStore.isAuthenticated) {
        return { name: 'welcome' }
      }
      // Check role-based access
      if (to.meta.roles?.length) {
        const userRoles = authStore.user?.roles || {}
        const hasRole = to.meta.roles.some((role) => userRoles[role])
        if (!hasRole) {
          return { name: 'home' }
        }
      }
    }
  })

  return Router
})
