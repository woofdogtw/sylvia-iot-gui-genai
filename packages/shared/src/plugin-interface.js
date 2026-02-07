/**
 * Plugin Interface Contract for Sylvia-IoT Shell
 *
 * All micro-frontend plugins must implement this interface to register
 * with the shell framework.
 *
 * @typedef {Object} Plugin
 * @property {string} id - Required: unique identifier for the plugin.
 * @property {string} name - Required: display name.
 * @property {string} category - Required: menu category ('core'|'data'|'router'|'applications'|'networks').
 * @property {Array} [routes] - Optional: Vue Router route definitions.
 * @property {Array<MenuItem>} [menuItems] - Optional: menu item configurations.
 * @property {Array<HeaderWidget>} [headerWidgets] - Optional: header widget components.
 * @property {number} [order] - Optional: display order within category (default 0).
 *
 * @typedef {Object} MenuItem
 * @property {string} label - Display text for the menu item.
 * @property {string} [icon] - Material icon name.
 * @property {string} route - Route path to navigate to.
 * @property {number} [order] - Sort order within category (default 0).
 *
 * @typedef {Object} HeaderWidget
 * @property {string} id - Unique identifier for the widget.
 * @property {Object} component - Vue component to render in the header.
 */

const VALID_CATEGORIES = ['core', 'data', 'router', 'applications', 'networks']

/**
 * Validate a plugin object against the interface contract.
 *
 * @param {Object} plugin - The plugin to validate.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validatePlugin(plugin) {
  const errors = []

  if (!plugin || typeof plugin !== 'object') {
    return { valid: false, errors: ['Plugin must be an object'] }
  }

  if (!plugin.id || typeof plugin.id !== 'string') {
    errors.push('Plugin "id" is required and must be a string')
  }

  if (!plugin.name || typeof plugin.name !== 'string') {
    errors.push('Plugin "name" is required and must be a string')
  }

  if (!plugin.category || typeof plugin.category !== 'string') {
    errors.push('Plugin "category" is required and must be a string')
  } else if (!VALID_CATEGORIES.includes(plugin.category)) {
    errors.push(
      `Plugin "category" must be one of: ${VALID_CATEGORIES.join(', ')}. Got: "${plugin.category}"`,
    )
  }

  if (plugin.routes && !Array.isArray(plugin.routes)) {
    errors.push('Plugin "routes" must be an array if provided')
  }

  if (plugin.menuItems && !Array.isArray(plugin.menuItems)) {
    errors.push('Plugin "menuItems" must be an array if provided')
  }

  if (plugin.headerWidgets && !Array.isArray(plugin.headerWidgets)) {
    errors.push('Plugin "headerWidgets" must be an array if provided')
  }

  return { valid: errors.length === 0, errors }
}

export default {
  VALID_CATEGORIES,
  validatePlugin,
}
