<template>
  <v-card v-if="post.content" class="mt-2">
    <details class="comment" open>
      <v-card-text v-if="post.content.rendered">
        <div class="markdown-body" v-html="post.content.rendered" />
      </v-card-text>
      <summary @click="details">
        <v-card-title v-if="post.content.url">
          <a :href="post.content.url">{{ post.content.title }}</a>
        </v-card-title>
        <v-card-text>
        {{ post.score }} points
        by {{ post.author.username }}
        &bull; <router-link
          :to="`/post/${post.postId}`"
          active-class="active"
          exact
          >{{ ago(post.createdAt) }}</router-link>
            &bull; {{ post.replies }} replies
        <span v-if="post.parent">
          &bull; <router-link
                   :to="`/post/${post.parent.postId}`"
                   class="nav-item nav-link"
                   active-class="active"
                   exact
                   >parent</router-link>
        </span>
        {{ detailsInfo }}
        </v-card-text>
      </summary>
      <v-card-actions>
        <v-item-group>
          <v-btn
            x-small
            outlined
            color="teal"
            @click="openReply"
            :data-target="`comment-${post.postId}-reply-form`"
            >
            <v-icon left dark>mdi-reply</v-icon>Reply
          </v-btn>&nbsp;
        </v-item-group>
        <v-item-group v-if="$keycloak.ready && $keycloak.authenticated">
          <VoteButton @reloadPost="reloadPost" :postId="post.postId" which="up" />
          <VoteButton @reloadPost="reloadPost" :postId="post.postId" which="down" />
          <VoteButton @reloadPost="reloadPost" :postId="post.postId" which="flag" />
        </v-item-group>
        <v-spacer />
        <v-chip outlined class="ml-2" x-small :key="`tag_${tag.canonical.slug}`" v-for="tag in post.tags">
          <router-link
            :to="`/tag/${tag.canonical.slug}`"
            class="nav-item nav-link"
            active-class="active"
            exact
            >{{ tag.canonical.slug }}</router-link>
        </v-chip>
      </v-card-actions>
      <v-expand-transition>

        <v-card
          v-if="showReplyForm"
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
              color="teal"
              @click="postReply"
              >
              <v-icon left dark>mdi-plus-box</v-icon>Add reply
            </v-btn>
            <v-btn
              x-small
              outlined
              color="red"
              @click="reply"
              >
              <v-icon left dark>mdi-close</v-icon>Close reply
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-expand-transition>
      <div class="replies">
        <Post @reloadPost="reloadPost" :key="`${child.postId}`" v-for="child in children" :post="child" :sortBy="sortBy" v-if="children" />
      </div>
    </details>
  </v-card>
</template>

<script>
import { DateTime } from 'luxon';
import { addPost, getSort } from '../lib/queries.js';

import TextEditor from './TextEditor.vue';
import VoteButton from './VoteButton.vue';

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
    ],
    data: function() {
        return {
            newPostContent: '',
            version: 0,
            open: true,
            showReplyForm: this.showReply,
        }
    },
    computed: {
        detailsInfo: function() {
            // const text = this.open ? '-' : `show ${this.post.replies + 1}`;
            const text = this.open ? 'hide all' : 'show all';
            return ` [${text}]`;
        },
        postId: function() {
            return this.post.postId;
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
    },
}
</script>
