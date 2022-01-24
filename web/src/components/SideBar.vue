<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <settings/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import Settings from '../components/Settings.vue';

export default {
    data: function() {
        return {
            sidebar: false,
        };
    },
    components: {
        Settings,
    },
    computed: {
    },
    methods: {
        authed() {
            return this.$keycloak.ready && this.$keycloak.authenticated;
        },
        isAdmin() {
            return this.authed() && this.$keycloak.hasResourceRole('admin');
        },
    },
}
</script>
