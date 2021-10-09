<template>
  <div>
    <v-switch v-model="nested" inset label="Nested" />
    <v-radio-group mandatory v-model="sortType">
      <v-radio :key="`sortTypeBtn_${s}`" v-for="s in sortTypes" :value="s" :label="s" />
    </v-radio-group>
  </div>
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
};
</script>
