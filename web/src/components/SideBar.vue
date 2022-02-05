<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <h3>About <span class="text-overline">nbfc.org</span></h3>

            <p>
              <v-divider class="mb-3 mt-3" /> If you took 3
              parts <a href="https://www.metafilter.com/">MetaFilter</a>, 2
              parts <a href="https://news.ycombinator.com/">Hacker News</a>, and
              1
              part <a href="https://spec.commonmark.org/current/">markdown</a>,
              that's us!
            </p>

            <p v-if="!authed()">
              <v-divider class="mb-3 mt-3" />
              Please register or login using the link above in order to post or comment.
            </p>

          </v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="authed()" cols="12">
        <v-card>
          <v-card-text>
            <h3>New Post</h3>
            <v-divider class="mb-3 mt-3" />
            <new-post :sidebar="true" :key="$route.fullPath" />
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
