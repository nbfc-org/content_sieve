<template>
  <v-app-bar app dense>
    <v-app-bar-nav-icon />
    <v-toolbar-title>
      <v-btn to="/" exact>content sieve</v-btn>
    </v-toolbar-title>
    <v-spacer/>
    <v-toolbar-items>
      <v-btn v-if="authed()" to="/new" small exact>New Post</v-btn>
      <v-btn v-if="authed()" to="/user/metavote" small exact>Meta Vote</v-btn>
      <v-btn to="/user/settings" small exact>Settings</v-btn>
      <v-btn v-if="authed()" small exact @click="logout">Log out</v-btn>
      <v-btn v-if="!authed()" small exact @click="login">Log in</v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
export default {
    methods: {
        authed() {
            return this.$keycloak.ready && this.$keycloak.authenticated;
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
