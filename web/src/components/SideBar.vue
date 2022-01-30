<template>
  <v-container fluid>
    <v-row>
      <v-col v-if="authed()" cols="12">
        <v-card>
          <v-card-text>
            <h3>New Post</h3>
            <v-divider class="mb-3 mt-3" />
            <new-post :narrow="true" :key="$route.fullPath" />
        </v-card-text>
      </v-card>
      </v-col>
      <v-col cols="12">
        <settings/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import Settings from '../components/Settings.vue';
import NewPost from '../components/NewPost.vue';

export default {
    data: function() {
        return {
        };
    },
    components: {
        Settings,
        NewPost,
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
