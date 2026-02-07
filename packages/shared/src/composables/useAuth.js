import { computed } from 'vue'

/**
 * Composable for accessing authentication state.
 * Reads auth tokens from localStorage to provide reactive state
 * without requiring direct access to the shell's Pinia store.
 *
 * @returns {{ isAuthenticated: import('vue').ComputedRef<boolean>, accessToken: import('vue').ComputedRef<string> }}
 */
export function useAuth() {
  const accessToken = computed(() => localStorage.getItem('access_token') || '')
  const isAuthenticated = computed(() => !!accessToken.value)

  return {
    isAuthenticated,
    accessToken,
  }
}

export default useAuth
