<template>
  <v-card>
    <v-card-text>
      <h3>Settings</h3>
      <v-divider class="mb-3 mt-3" />
      <v-card flat>
        <v-card-text>
          <h5>Sort Order for Posts & Comments</h5>
          <v-radio-group mandatory v-model="sortType">
            <v-radio :key="`sortTypeBtn_${s}`" v-for="[s, l] in sortTypes" :value="s" :label="l" />
          </v-radio-group>
          <h5>Comment Settings</h5>
          <v-switch v-model="nested" inset label="Nested?" />
        </v-card-text>
      </v-card>
      <v-container v-if="authed()">
        <v-divider class="mb-3 mt-3" />
        <v-col class="text-right">
          <v-btn color="primary" size="small" outlined v-if="authed()" @click="logout">
            Log out
          </v-btn>
        </v-col>
      </v-container>
    </v-card-text>
  </v-card>
</template>
<script>
import { mapState } from 'vuex';
import { sortTypes as _st } from '../lib/queries.js';
import { capitalCase } from 'capital-case';

export default {
    computed: {
        sortTypes: function() {
            return _st.map(s => [s, capitalCase(s)]);
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
                return this.sortTypes[this.settings.sortType || 0][0];
            },
            set(sortType) {
                const settings = { ...this.settings, sortType: _st.indexOf(sortType) };
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
            this.$keycloak.logoutFn({ redirectUri: `${window.location.origin}/` });
            this.$store.dispatch('logoutSession');
        },
    },
};
</script>
