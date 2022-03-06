<template>
  <v-app>
    <v-layout>
      <app-nav/>
      <v-main>
        <v-container fluid>
          <v-row no-gutters>
            <v-col cols="12" sm="8">
              <router-view></router-view>
            </v-col>
            <v-col cols="12" sm="4">
              <side-bar />
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script>
import AppNav from './AppNav.vue';
import SideBar from './SideBar.vue';
import { mapActions, mapGetters } from "vuex";

export default {
    components: {
        AppNav,
        SideBar,
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
