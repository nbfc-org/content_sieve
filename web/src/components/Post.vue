<template>
  <v-card v-if="post.content" flat class="rounded-0">
    <details class="comment" open>
      <v-row dense>
        <v-col :cols="post.tags.length ? 9 : 12">
          <v-card-text v-if="post.content.rendered">
            <div class="markdown-body" v-html="post.content.rendered" />
          </v-card-text>
          <v-card-text v-if="post.content.url">
            <a :href="post.content.url">{{ post.content.title }}</a>
          </v-card-text>
        </v-col>
        <v-col cols="3" v-if="post.tags.length">
          <v-card flat>
            <v-card-text>
            <v-chip
              color="primary"
              class="ml-2"
              outlined
              small
              label
              :key="`tag_${tag.canonical.slug}`"
              v-for="tag in post.tags">
              <v-icon left>
                {{ mdiLabel }}
              </v-icon>
              <router-link
                :to="`/tag/${tag.canonical.slug}`"
                class="nav-item nav-link"
                active-class="active"
                exact
                >{{ tag.canonical.slug }}</router-link>
            </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <summary class="text--secondary" @click="details">
        <v-card-text>
        {{ post.author.username }}
        &bull; <router-link
          :to="`/post/${post.postId}`"
          active-class="active"
          exact
          >{{ ago(post.createdAt) }}</router-link>
        &bull; score: {{ post.score }}
        <span v-if="post.parent">
          &bull; <router-link
                   :to="`/post/${post.parent.postId}`"
                   class="nav-item nav-link"
                   active-class="active"
                   exact
                   >parent</router-link>
        </span>
        <span v-if="settings.nested && childrenLength">
        &bull; {{ detailsInfo }}
        </span>
        <span v-if="!childrenLength && post.replies !== 0">
        &bull; <router-link
          :to="`/post/${post.postId}`"
          active-class="active"
          exact
          >{{ post.replies }} replies</router-link>
        </span>
        </v-card-text>
      </summary>
      <v-card-actions>
        <v-item-group v-if="!justOnePost">
          <v-btn
            x-small
            plain
            color="primary"
            @click="openReply"
            :data-target="`comment-${post.postId}-reply-form`"
            >
            <v-icon left dark>{{ mdiReply }}</v-icon>Reply
          </v-btn>&nbsp;
        </v-item-group>
        <v-item-group v-if="$keycloak.ready && $keycloak.authenticated">
          <VoteButton @reloadPost="reloadPost" :postId="post.postId" which="up" />
          <VoteButton @reloadPost="reloadPost" :postId="post.postId" which="down" />
          <VoteButton @reloadPost="reloadPost" :postId="post.postId" which="flag" />
        </v-item-group>
      </v-card-actions>
      <v-expand-transition>
        <v-card
          v-if="showReplyForm"
          flat
          class="transition-fast-in-fast-out v-card--reveal"
          style="height: 100%;"
          >
          <v-card-text :id="`comment-${post.postId}-reply-form`">
            <TextEditor @saveContent="saveContent" :key="`${post.postId}_${version}`" :text="newPostContent" />
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-btn
              x-small
              outlined
              color="primary"
              @click="postReply"
              >
              <v-icon left dark>{{ mdiPlusBox }}</v-icon>Add reply
            </v-btn>
            <v-btn
              x-small
              outlined
              color="error"
              @click="reply"
              >
              <v-icon left dark>{{ mdiClose }}</v-icon>Close reply
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-expand-transition>
      <v-card-actions v-if="hasMore">
        <v-btn
          x-small
          outlined
          color="primary"
          @click="loadIt"
          >
          <v-icon left dark>{{ mdiDownloadCircle }}</v-icon>Load More
        </v-btn>
      </v-card-actions>
      <div class="replies">
        <Post @reloadPost="reloadPost" @loadMore="loadMore" :key="`${child.postId}`" v-for="child in children" :post="child" :sortBy="sortBy" v-if="children" />
      </div>
    </details>
  </v-card>
</template>

<script>
import { DateTime } from 'luxon';
import { addPost, getSort } from '../lib/queries.js';

import TextEditor from './TextEditor.vue';
import VoteButton from './VoteButton.vue';
import { mapState } from 'vuex';

import { mdiReply, mdiDownloadCircle, mdiPlusBox, mdiLabel, mdiClose } from '@mdi/js';

export default {
    name: 'Post',
    components: {
        TextEditor,
        VoteButton,
    },
    props: [
        'post',
        'sortBy',
        'showReply',
        'topLevel',
    ],
    data: function() {
        return {
            mdiReply,
            mdiDownloadCircle,
            mdiPlusBox,
            mdiLabel,
            mdiClose,
            newPostContent: '',
            version: 0,
            open: true,
            showReplyForm: this.showReply,
            justOnePost: this.topLevel || false
        }
    },
    computed: {
        ...mapState({
            settings: state => {
                const { user } = state.session;
                if (!user) { return {}; }
                return user.settings;
            },
        }),
        detailsInfo: function() {
            const text = `${this.open ? 'hide' : 'show'} ${this.post.replies + 1}`;
            // const text = this.open ? 'hide all' : 'show all';
            return `[${text}]`;
        },
        postId: function() {
            return this.post.postId;
        },
        hasMore: function() {
            return !this.justOnePost && this.post.replies > 0 && !this.childrenLength;
        },
        childrenLength: function() {
            return this.post.nested_kids_length || this.children.length;
        },
        children: function() {
            const kids = this.post.children || [];
            if (this.sortBy === undefined) {
                return kids;
            }
            return kids.sort(getSort(this.sortBy));
        },
    },
    methods: {
        details: function(event) {
            const o = event.currentTarget.parentElement.getAttribute('open');
            this.open = o === null;
        },
        ago: function(millis) {
            return DateTime.fromMillis(millis).toRelative();
        },
        openReply: function(event) {
            if (this.$keycloak.authenticated) {
                this.showReplyForm = true;
            } else {
                const basePath = window.location.toString();
                this.$keycloak.login({ redirectUri: `${window.location.origin}/post/${this.postId}?showReply=true` });
            }
        },
        reply: function(event) {
            this.showReplyForm = false;
        },
        saveContent: function(content) {
            this.newPostContent = content;
        },
        postReply: async function(event) {
            const parentId = this.postId;
            const body = this.newPostContent;
            const new_post = await addPost.bind(this)(event, { parentId, body });
            this.newPostContent = '';
            this.version++;
            this.reply(event);
        },
        reloadPost: function(cache, post) {
            this.$emit('reloadPost', cache, post);
        },
        loadMore: function(postId) {
            this.$emit('loadMore', postId);
        },
        loadIt: function() {
            this.$emit('loadMore', this.postId);
        },
    },
}
</script>
