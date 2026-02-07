import ExamplePage from './pages/ExamplePage.vue'

/**
 * Example plugin demonstrating the Sylvia-IoT plugin interface.
 */
export default {
  id: 'mfe-example',
  name: 'Example Plugin',
  category: 'applications',
  order: 100,
  routes: [
    {
      path: '/example',
      name: 'example',
      component: ExamplePage,
    },
  ],
  menuItems: [
    {
      label: 'Example',
      icon: 'science',
      route: '/example',
      order: 100,
    },
  ],
}
