import DashboardPage from './pages/DashboardPage.vue'
import WanPage from './pages/WanPage.vue'
import LanPage from './pages/LanPage.vue'
import WlanPage from './pages/WlanPage.vue'
import WwanPage from './pages/WwanPage.vue'
import SystemClockWidget from './components/SystemClockWidget.vue'
import ServiceInfoWidget from './components/ServiceInfoWidget.vue'

export default {
  id: 'mfe-router',
  name: 'Router',
  category: 'router',
  order: 0,
  routes: [
    { path: '/router/dashboard', name: 'router-dashboard', component: DashboardPage },
    { path: '/router/wan', name: 'router-wan', component: WanPage },
    { path: '/router/lan', name: 'router-lan', component: LanPage },
    { path: '/router/wlan', name: 'router-wlan', component: WlanPage },
    { path: '/router/wwan', name: 'router-wwan', component: WwanPage },
  ],
  menuItems: [
    { label: 'router.menu.dashboard', icon: 'dashboard', route: '/router/dashboard', order: 1 },
    { label: 'router.menu.wan', icon: 'language', route: '/router/wan', order: 2 },
    { label: 'router.menu.lan', icon: 'device_hub', route: '/router/lan', order: 3 },
    { label: 'router.menu.wlan', icon: 'wifi', route: '/router/wlan', order: 4 },
    { label: 'router.menu.wwan', icon: 'cell_tower', route: '/router/wwan', order: 5 },
  ],
  headerWidgets: [
    { id: 'router-clock', component: SystemClockWidget },
    { id: 'router-version', component: ServiceInfoWidget },
  ],
}
