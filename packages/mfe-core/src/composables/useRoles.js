import { ref, computed, onMounted } from 'vue'
import { api } from '@sylvia-iot/shared'

/**
 * Composable for fetching and checking user roles from tokeninfo.
 * Roles object from API: { admin: bool, manager: bool, service: bool, dev: bool }
 */
export function useRoles() {
  const roles = ref({})
  const loaded = ref(false)

  const isAdmin = computed(() => !!roles.value.admin)
  const isManager = computed(() => !!roles.value.manager)
  const isDev = computed(() => !!roles.value.dev)
  const isService = computed(() => !!roles.value.service)
  const isAdminOrManager = computed(() => isAdmin.value || isManager.value)

  async function fetchRoles() {
    try {
      const baseUrl = window.config?.auth?.baseUrl || ''
      const res = await api.get(`${baseUrl}/api/v1/auth/tokeninfo`)
      roles.value = res.data?.data?.roles || {}
    } catch {
      roles.value = {}
    }
    loaded.value = true
  }

  onMounted(fetchRoles)

  return {
    roles,
    loaded,
    isAdmin,
    isManager,
    isDev,
    isService,
    isAdminOrManager,
    fetchRoles,
  }
}
