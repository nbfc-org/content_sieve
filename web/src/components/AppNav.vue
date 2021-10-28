<template>
  <div>
    <v-navigation-drawer class="hidden-sm-and-up" v-model="sidebar" app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">
            {{ title }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item v-for="item in menuItems" v-if="item.test()" :key="item.title" :to="item.path">
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>{{ item.title }}</v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app dense>
      <span class="hidden-sm-and-up">
        <v-app-bar-nav-icon @click="sidebar = !sidebar"></v-app-bar-nav-icon>
      </span>
      <v-toolbar-title>
        <v-btn to="/" exact>{{ title }}</v-btn>
      </v-toolbar-title>
      <v-spacer/>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn x-small v-for="item in menuItems" v-if="item.test()" :key="item.title" :to="item.path">
          {{ item.title }}
        </v-btn>
      </v-toolbar-items>
      <v-toolbar-items>
        <v-btn v-if="authed()" x-small @click="logout">
          Log out
        </v-btn>
        <v-btn v-if="!authed()" x-small @click="login">
          Log in
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
  </div>
</template>

<script>
import pkg from '../../package.json';

import { mdiAccountCog, mdiBallot, mdiNotePlus } from '@mdi/js';
import { mdiLoginVariant, mdiLogoutVariant } from '@mdi/js';

export default {
    data: function() {
        return {
            mdiLogoutVariant,
            mdiLoginVariant,
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
                { title: "Settings",
                  path: "/user/settings",
                  icon: mdiAccountCog,
                  test: () => true,
                },
            ],
            sidebar: false,
        };
    },
    computed: {
        title() {
            return pkg.productName;
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
        logout() {
            const basePath = window.location.toString();
            this.$keycloak.logoutFn({ redirectUri: basePath });
            this.$store.dispatch('logoutSession');
        },
    },
}
</script>
