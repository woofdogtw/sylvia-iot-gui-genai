import UserPage from './pages/UserPage.vue'
import ClientPage from './pages/ClientPage.vue'
import UnitPage from './pages/UnitPage.vue'
import ApplicationPage from './pages/ApplicationPage.vue'
import NetworkPage from './pages/NetworkPage.vue'
import DevicePage from './pages/DevicePage.vue'
import DeviceRoutePage from './pages/DeviceRoutePage.vue'
import NetworkRoutePage from './pages/NetworkRoutePage.vue'
import DlDataBufferPage from './pages/DlDataBufferPage.vue'

export default {
  id: 'mfe-core',
  name: 'Core',
  category: 'core',
  order: 0,
  routes: [
    { path: '/core/user', name: 'core-user', component: UserPage, meta: { roles: ['admin', 'manager'] } },
    { path: '/core/client', name: 'core-client', component: ClientPage, meta: { roles: ['admin', 'dev'] } },
    { path: '/core/unit', name: 'core-unit', component: UnitPage },
    { path: '/core/application', name: 'core-application', component: ApplicationPage },
    { path: '/core/network', name: 'core-network', component: NetworkPage },
    { path: '/core/device', name: 'core-device', component: DevicePage },
    { path: '/core/device-route', name: 'core-device-route', component: DeviceRoutePage },
    { path: '/core/network-route', name: 'core-network-route', component: NetworkRoutePage },
    { path: '/core/dldata-buffer', name: 'core-dldata-buffer', component: DlDataBufferPage },
  ],
  menuItems: [
    { label: 'core.menu.user', icon: 'person', route: '/core/user', order: 1, roles: ['admin', 'manager'] },
    { label: 'core.menu.client', icon: 'vpn_key', route: '/core/client', order: 2, roles: ['admin', 'dev'] },
    { label: 'core.menu.unit', icon: 'corporate_fare', route: '/core/unit', order: 3 },
    { label: 'core.menu.application', icon: 'apps', route: '/core/application', order: 4 },
    { label: 'core.menu.network', icon: 'lan', route: '/core/network', order: 5 },
    { label: 'core.menu.device', icon: 'devices_other', route: '/core/device', order: 6 },
    { label: 'core.menu.deviceRoute', icon: 'alt_route', route: '/core/device-route', order: 7 },
    { label: 'core.menu.networkRoute', icon: 'swap_horiz', route: '/core/network-route', order: 8 },
    { label: 'core.menu.dlDataBuffer', icon: 'download', route: '/core/dldata-buffer', order: 9 },
  ],
}
