<template>
  <v-app-bar app density="compact" absolute>
    <v-app-bar-title>
      <v-btn to="/" exact>{{ title }}</v-btn>
    </v-app-bar-title>

    <v-spacer/>

    <v-btn v-for="item in testedItems" :key="item.title" :to="item.path">
      {{ item.title }}
    </v-btn>

    <v-btn v-if="authed()" to="/user/profile">
      <v-icon>{{ mdiAccountCog }}</v-icon>
      {{ $keycloak.userName }}
    </v-btn>
    <v-btn v-else @click="login">
      Login
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
                /*
                { title: "New Post",
                  path: "/new",
                  icon: mdiNotePlus,
                  test: this.authed,
                },
                */
                { title: "Meta Vote",
                  path: "/user/metavote",
                  icon: mdiBallot,
                  test: this.isAdmin,
                },
            ],
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
