const routes = [
  {
    path: '/',
    name: 'root',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'welcome', component: () => import('pages/WelcomePage.vue') },
      { path: 'home', name: 'home', meta: { requiresAuth: true }, component: () => import('pages/HomePage.vue') },
      { path: 'about', name: 'about', meta: { requiresAuth: true }, component: () => import('pages/AboutPage.vue') },
      { path: 'settings', name: 'settings', meta: { requiresAuth: true }, component: () => import('pages/SettingsPage.vue') },
    ],
  },
  {
    path: '/auth/callback',
    component: () => import('pages/OAuthCallbackPage.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
