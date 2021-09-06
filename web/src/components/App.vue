<template>
  <v-app>
    <app-nav></app-nav>
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppNav from './AppNav.vue';

export default {
  components: {
    AppNav,
  },
}
</script>

<style src="@/styles/vuetify-custom.css" />
<style src="@/../node_modules/github-markdown-css/github-markdown.css" />
