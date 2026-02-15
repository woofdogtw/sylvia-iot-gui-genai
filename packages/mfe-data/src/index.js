import ApplicationUlDataPage from './pages/ApplicationUlDataPage.vue'
import ApplicationDlDataPage from './pages/ApplicationDlDataPage.vue'
import NetworkUlDataPage from './pages/NetworkUlDataPage.vue'
import NetworkDlDataPage from './pages/NetworkDlDataPage.vue'
import OperationDataPage from './pages/OperationDataPage.vue'

export default {
  id: 'mfe-data',
  name: 'Data',
  category: 'data',
  order: 0,
  routes: [
    { path: '/data/application-ul', name: 'data-app-ul', component: ApplicationUlDataPage },
    { path: '/data/application-dl', name: 'data-app-dl', component: ApplicationDlDataPage },
    { path: '/data/network-ul', name: 'data-net-ul', component: NetworkUlDataPage },
    { path: '/data/network-dl', name: 'data-net-dl', component: NetworkDlDataPage },
    { path: '/data/operation', name: 'data-operation', component: OperationDataPage },
  ],
  menuItems: [
    { label: 'data.menu.applicationUl', icon: 'cloud_upload', route: '/data/application-ul', order: 1 },
    { label: 'data.menu.applicationDl', icon: 'cloud_download', route: '/data/application-dl', order: 2 },
    { label: 'data.menu.networkUl', icon: 'cell_tower', route: '/data/network-ul', order: 3 },
    { label: 'data.menu.networkDl', icon: 'settings_input_antenna', route: '/data/network-dl', order: 4 },
    { label: 'data.menu.operation', icon: 'history', route: '/data/operation', order: 5 },
  ],
}
