<template>
  <v-app-bar app dense>
    <v-toolbar-title>
      <v-btn to="/" exact>{{ title }}</v-btn>
    </v-toolbar-title>
    <v-spacer/>
    <v-toolbar-items>
      <v-btn v-if="authed()" to="/new" x-small exact>New Post</v-btn>
      <v-btn v-if="isAdmin()" to="/user/metavote" x-small exact>Meta Vote</v-btn>
      <v-btn to="/user/settings" x-small exact>Settings</v-btn>
      <v-btn v-if="authed()" x-small exact @click="logout">Log out</v-btn>
      <v-btn v-if="!authed()" x-small exact @click="login">Log in</v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
import pkg from '../../package.json';
export default {
    computed: {
        title() {
            return pkg.productName;
        },
    },
    methods: {
        authed() {
            return this.$keycloak.ready && this.$keycloak.authenticated;
        },
        isAdmin() {
            return this.authed() && this.$keycloak.hasResourceRole('admin');
        },
        login() {
            const basePath = window.location.toString();
            this.$keycloak.login({ redirectUri: basePath });
        },
        logout() {
            const basePath = window.location.toString();
            this.$keycloak.logoutFn({ redirectUri: basePath });
            this.$store.dispatch('logoutSession');
        },
    },
}
</script>
