<template>
  <v-card>
    <v-card-text>
      <h3>Settings</h3>
      <v-divider class="mb-3 mt-3" />
      <h5>Sort Order for Posts & Comments</h5>
      <v-radio-group mandatory v-model="sortType">
        <v-radio :key="`sortTypeBtn_${s}`" v-for="s in sortTypes" :value="s" :label="s" />
      </v-radio-group>
      <h5>Comment Settings</h5>
      <v-switch v-model="nested" inset label="Nested?" />
    </v-card-text>
    <v-card-actions>
      <v-item-group>
        <v-btn color="primary" outlined v-if="authed()" @click="logout">
          Log out
        </v-btn>
      </v-item-group>
    </v-card-actions>
  </v-card>
</template>
<script>

import { mapState } from 'vuex';
import { sortTypes } from '../lib/queries.js';

export default {
    computed: {
        sortTypes: function() {
            return sortTypes;
        },
        ...mapState({
            settings: state => {
                const { user } = state.session;
                if (!user) { return {}; }
                return user.settings;
            },
        }),
        nested: {
            get() {
                return this.settings.nested;
            },
            set(nested) {
                const settings = { ...this.settings, nested: Boolean(nested) };
                delete settings.__typename;
                this.$store.dispatch('saveSettings', {
                    kc: this.$keycloak,
                    settings,
                });
            },
        },
        sortType: {
            get() {
                return this.sortTypes[this.settings.sortType || 0];
            },
            set(sortType) {
                const settings = { ...this.settings, sortType: this.sortTypes.indexOf(sortType) };
                delete settings.__typename;
                this.$store.dispatch('saveSettings', {
                    kc: this.$keycloak,
                    settings,
                });
            },
        },
    },
    methods: {
        authed() {
            return this.$keycloak.ready && this.$keycloak.authenticated;
        },
        logout() {
            const basePath = window.location.toString();
            this.$keycloak.logoutFn({ redirectUri: basePath });
            this.$store.dispatch('logoutSession');
        },
    },
};
</script>
