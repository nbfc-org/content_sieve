<template>
    <v-app-bar app density="compact">
      <v-app-bar-title>
        <v-btn to="/" exact>{{ title }}</v-btn>
      </v-app-bar-title>

      <v-spacer/>

      <v-btn size="x-small" v-for="item in testedItems()" :key="item.title" :to="item.path">
        {{ item.title }}
      </v-btn>

      <v-divider inset vertical></v-divider>

      <v-btn v-if="authed()" size="x-small" to="/user/settings">
        <v-icon>{{ mdiAccountCog }}</v-icon>
      </v-btn>
      <v-btn v-if="!authed()" size="x-small" @click="login">
        <v-icon>{{ mdiLoginVariant }}</v-icon>
      </v-btn>

    </v-app-bar>
</template>

<script>
import pkg from '../../package.json';

import { mdiAccountCog, mdiBallot, mdiNotePlus } from '@mdi/js';
import { mdiLoginVariant } from '@mdi/js';

export default {
    data: function() {
        return {
            mdiLoginVariant,
            mdiAccountCog,
            menuItems: [
                { title: "New Post",
                  path: "/new",
                  icon: mdiNotePlus,
                  test: this.authed,
                },
                { title: "Meta Vote",
                  path: "/user/metavote",
                  icon: mdiBallot,
                  test: this.isAdmin,
                },
            ],
            sidebar: false,
        };
    },
    computed: {
        title() {
            return pkg.productName;
        },
        testedItems() {
            return this.menuItems.filter(i => i.test());
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
    },
}
</script>
