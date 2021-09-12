<template>
  <v-app-bar app dense>
    <v-toolbar-title>
      <v-btn to="/" exact>content sieve</v-btn>
    </v-toolbar-title>
    <v-spacer/>
    <v-toolbar-items>
      <v-btn to="/tree" small exact>full tree</v-btn>
      <v-btn v-if="$auth.isAuthenticated" to="/new" small exact>new post</v-btn>
      <v-btn v-if="!$auth.loading && $auth.isAuthenticated" small exact @click="logout">Log out</v-btn>
      <v-btn v-if="!$auth.loading && !$auth.isAuthenticated" small exact @click="login">Log in</v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
export default {
    methods: {
        login() {
            this.$auth.loginWithRedirect();
        },
        logout() {
            this.$auth.logout({
                returnTo: window.location.origin
            });
            this.$store.dispatch('logoutSession');
        },
    },
}
</script>
