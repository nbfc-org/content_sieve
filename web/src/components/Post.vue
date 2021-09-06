<template>
  <v-card v-if="post.content">
    <details class="comment" open>
      <summary @click="details">
        <v-card-title v-if="post.content.url">
          <a :href="post.content.url">{{ post.content.title }}</a>
        </v-card-title>
        <v-card-text>
        {{ post.votes.length }} votes
        by <a href="#" class="comment-author">{{ post.author.username }}</a>
        &bull; <router-link
          :to="`/post/${post.postId}`"
          active-class="active"
          exact
          >{{ ago(post.createdAt) }}</router-link>
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
        <v-card-text v-if="post.tags.length">
          <v-chip :key="`tag_${tag.canonical.slug}`" v-for="tag in post.tags">
            <router-link
              :to="`/tag/${tag.canonical.slug}`"
              class="nav-item nav-link"
              active-class="active"
              exact
              >{{ tag.canonical.slug }}</router-link>
          </v-chip>
        </v-card-text>
      </summary>
      <v-card-text v-if="post.content.rendered">
        <div class="markdown-body" v-html="post.content.rendered" />
      </v-card-text>
      <v-card-actions>
        <v-btn
          text
          color="teal accent-4"
          @click="openReply"
          :data-target="`comment-${post.postId}-reply-form`"
          >
          Reply
        </v-btn>
        <v-btn
          color="deep-purple lighten-2"
          text
          @click="up"
          >
          Vote up
        </v-btn>
        <v-btn
          color="deep-purple lighten-2"
          text
          @click="down"
          >
          Vote down
        </v-btn>
        <v-btn
          color="red"
          text
          @click="flag"
          >
          Flag
        </v-btn>

      </v-card-actions>
      <v-expand-transition>

        <v-card
          v-if="showReply"
          class="transition-fast-in-fast-out v-card--reveal"
          style="height: 100%;"
          >
          <v-card-text class="pb-0" :id="`comment-${post.postId}-reply-form`">
            <TextEditor @saveContent="saveContent" :key="`${post.postId}_${version}`" :text="newPostContent" />
          </v-card-text>
          <v-card-actions class="pt-0">
            <v-btn
              text
              color="teal accent-4"
              @click="postReply"
              >
              Submit
            </v-btn>
            <v-btn
              text
              color="teal accent-4"
              @click="reply"
              >
              Close
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
import { VOTE, addPost, getSort } from '../lib/queries.js';

import TextEditor from './TextEditor.vue';

export default {
    name: 'Post',
    components: {
        TextEditor,
    },
    props: [
        'post',
        'sortBy',
    ],
    data: function() {
        return {
            newPostContent: '',
            version: 0,
            open: true,
            showReply: false,
        }
    },
    computed: {
        detailsInfo: function() {
            const num = this.children ? this.children.length : 0;
            // const text = this.open ? '-' : `show ${num + 1}`;
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
            this.showReply = true;
        },
        reply: function(event) {
            this.showReply = false;
        },
        vote: async function(event, postId, type) {
            try {
                const w = await this.$apollo.mutate({
                    mutation: VOTE,
                    variables: {
                        vote: {
                            postId,
                            type,
                        }
                    },
                    update: (cache, result) => {
                        this.$emit('reloadPost', cache, result.data.vote);
                    },
                });
            } catch(err) {
                // this.error = err;
                console.error(err);
            }
            // this.$emit('dirty', event, this.postId);
        },
        flag: function(event) {
            this.vote(event, this.postId, "FLAG");
        },
        up: function(event) {
            this.vote(event, this.postId, "UP");
        },
        down: function(event) {
            this.vote(event, this.postId, "DOWN");
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
