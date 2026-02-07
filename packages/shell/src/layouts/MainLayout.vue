<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>{{ currentTitle }}</q-toolbar-title>

        <!-- Header widgets area -->
        <template v-for="widget in pluginStore.headerWidgets" :key="widget.id">
          <component :is="widget.component" />
        </template>

        <!-- Auth area -->
        <template v-if="authStore.isAuthenticated">
          <q-btn flat no-caps :label="userName" icon="person">
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>{{ t('auth.logout') }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </template>
        <template v-else>
          <q-btn flat no-caps :label="t('auth.login')" icon="login" @click="authStore.login()" />
        </template>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <!-- Home -->
        <q-item clickable v-ripple :to="{ name: 'home' }" exact>
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>{{ t('menu.home') }}</q-item-section>
        </q-item>

        <q-separator />

        <!-- Dynamic plugin categories -->
        <template v-for="category in pluginStore.CATEGORIES" :key="category">
          <q-expansion-item
            v-if="pluginStore.menuByCategory[category]?.length"
            :icon="categoryIcon(category)"
            :label="t(`menu.${category}`)"
          >
            <q-item
              v-for="item in pluginStore.menuByCategory[category]"
              :key="item.route"
              clickable
              v-ripple
              :to="item.route"
              :inset-level="1"
              @click="onMenuItemClick"
            >
              <q-item-section avatar v-if="item.icon">
                <q-icon :name="item.icon" />
              </q-item-section>
              <q-item-section>{{ item.label }}</q-item-section>
            </q-item>
          </q-expansion-item>
          <q-expansion-item
            v-else
            :icon="categoryIcon(category)"
            :label="t(`menu.${category}`)"
            disable
          />
        </template>

        <q-separator />

        <!-- Settings -->
        <q-item clickable v-ripple :to="{ name: 'settings' }">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>{{ t('menu.settings') }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'stores/auth-store.js'
import { usePluginStore } from 'stores/plugin-store.js'

const { t } = useI18n()
const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const pluginStore = usePluginStore()

const leftDrawerOpen = ref(false)

const userName = computed(() => {
  return authStore.user?.name || authStore.user?.account || ''
})

const currentTitle = computed(() => {
  if (route.meta?.title) {
    return route.meta.title
  }
  return t('app.title')
})

const categoryIcons = {
  core: 'hub',
  data: 'storage',
  router: 'router',
  applications: 'apps',
  networks: 'cell_tower',
}

function categoryIcon(category) {
  return categoryIcons[category] || 'folder'
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function onMenuItemClick() {
  if ($q.screen.lt.md) {
    leftDrawerOpen.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'welcome' })
}
</script>
