import { boot } from 'quasar/wrappers'
import { usePluginStore } from 'stores/plugin-store.js'
import mfeExample from '@sylvia-iot/mfe-example'

/**
 * Boot file for loading and registering plugins.
 *
 * To register a plugin, import it and add it to the `plugins` array below.
 * Each plugin must follow the interface defined in @sylvia-iot/shared/plugin-interface.
 */
const plugins = [
  mfeExample,
]

export default boot(({ store, router }) => {
  const pluginStore = usePluginStore(store)

  for (const plugin of plugins) {
    const registered = pluginStore.registerPlugin(plugin)
    if (registered && plugin.routes?.length) {
      for (const route of plugin.routes) {
        router.addRoute('root', {
          ...route,
          path: route.path.replace(/^\//, ''),
          meta: { ...route.meta, requiresAuth: true },
        })
      }
    }
  }
})
