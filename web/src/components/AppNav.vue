<template>
  <v-app-bar app dense>
    <v-toolbar-title>
      <v-btn to="/" exact>content sieve</v-btn>
    </v-toolbar-title>
    <v-spacer/>
    <v-toolbar-items>
      <v-btn to="/tree" small exact>full tree</v-btn>
      <v-btn v-if="$keycloak.ready && $keycloak.authenticated" to="/new" small exact>new post</v-btn>
      <v-btn v-if="$keycloak.ready && $keycloak.authenticated" small exact @click="logout">Log out</v-btn>
      <v-btn v-if="$keycloak.ready && !$keycloak.authenticated" small exact @click="login">Log in</v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
export default {
    methods: {
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
