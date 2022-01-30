<template>
  <h3>foo's profile</h3>
  <v-container v-if="authed()">
    <v-divider class="mb-3 mt-3" />
    <v-col class="text-right">
      <v-btn color="primary" size="small" outlined v-if="authed()" @click="logout">
        Log out
      </v-btn>
    </v-col>
  </v-container>
</template>
<script>
export default {
    data: {
    },
    methods: {
        authed() {
            return this.$keycloak.ready && this.$keycloak.authenticated;
        },
        logout() {
            this.$keycloak.logoutFn({ redirectUri: `${window.location.origin}/` });
            this.$store.dispatch('logoutSession');
        },
    },
};
</script>
