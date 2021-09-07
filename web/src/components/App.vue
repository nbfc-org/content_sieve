<template>
  <v-app>
    <app-nav></app-nav>
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
      <v-card>
        <!-- Check that the SDK client is not currently loading before accessing is methods -->
        <div v-if="!$auth.loading">
          <!-- show login when not authenticated -->
          <button v-if="!$auth.isAuthenticated" @click="login">Log in</button>
          <!-- show logout when authenticated -->
          <button v-if="$auth.isAuthenticated" @click="logout">Log out</button>
        </div>
      </v-card>
    </v-main>
  </v-app>
</template>

<script>
import AppNav from './AppNav.vue';

export default {
    components: {
        AppNav,
    },
    methods: {
        login() {
            this.$auth.loginWithRedirect();
        },
        // Log the user out
        logout() {
            this.$auth.logout({
                returnTo: window.location.origin
            });
        },
    },
}
</script>

<style src="@/styles/vuetify-custom.css" />
<style src="@/../node_modules/github-markdown-css/github-markdown.css" />
<style src="@/styles/markdown-custom.css" />
