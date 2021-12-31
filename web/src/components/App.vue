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
import { mapActions, mapGetters } from "vuex";

export default {
    components: {
        AppNav,
    },
    methods: {
        ...mapActions(["getSession"]),
    },
    created() {
        this.getSession();
    },
}
</script>

<style src="../styles/vuetify-custom.css" />
<style src="@/../node_modules/github-markdown-css/github-markdown.css" />
<style src="../styles/markdown-custom.css" />
