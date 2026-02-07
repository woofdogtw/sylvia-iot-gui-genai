import { computed } from 'vue'

/**
 * Composable for accessing runtime configuration.
 * Provides reactive access to window.config values.
 *
 * @returns {{ config: import('vue').ComputedRef<Object>, authConfig: import('vue').ComputedRef<Object>, coremgrConfig: import('vue').ComputedRef<Object>, dataConfig: import('vue').ComputedRef<Object> }}
 */
export function useConfig() {
  const config = computed(() => window.config || {})
  const authConfig = computed(() => config.value.auth || {})
  const coremgrConfig = computed(() => config.value.coremgr || {})
  const dataConfig = computed(() => config.value.data || {})

  return {
    config,
    authConfig,
    coremgrConfig,
    dataConfig,
  }
}

export default useConfig
