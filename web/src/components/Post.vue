<template>
  <details open class="comment" :id="post.postId" v-on:click="details">
    <a :href="`#${post.postId}`" class="comment-border-link" />
    <summary>
      <div class="comment-info">
        <a v-if="!open" :href="`#${post.postId}`" class="comment-border-link" />
        <div class="comment-url" v-if="post.content.url"><a :href="post.content.url">{{ post.content.title }}</a></div>
        {{ post.votes.length }} votes
        by <a href="#" class="comment-author">{{ post.author.username }}</a>
        <router-link
          :to="`/post/${post.postId}`"
          active-class="active"
          exact
          >{{ ago(post.createdAt) }}</router-link>
        {{ detailsInfo }}
        <div>
          <span v-if="post.parent">
          &bull; <router-link
            :to="`/post/${post.parent.postId}`"
            class="nav-item nav-link"
            active-class="active"
            exact
            >parent</router-link>
          </span>
          <span v-for="tag in post.tags">
            &bull; <router-link
                     :to="`/tag/${tag.canonical.slug}`"
                     class="nav-item nav-link"
                     active-class="active"
                     exact
                     >{{ tag.canonical.slug }}</router-link>
          </span>
        </div>
      </div>
    </summary>

    <div class="comment-body">
      <div v-if="post.content.rendered" class="markdown-body" v-html="post.content.rendered" />
      <button class="linky" type="button" v-on:click="reply" data-toggle="reply-form" :data-target="`comment-${post.postId}-reply-form`">Reply</button>
      <button class="linky" type="button" v-on:click="up">Vote up</button>
      <button class="linky" type="button" v-on:click="down">Vote down</button>
      <button class="linky" type="button" v-on:click="flag">Flag</button>

      <!-- Reply form start -->
      <div class="reply-form d-none" :id="`comment-${post.postId}-reply-form`">
        <TextEditor @saveContent="saveContent" :key="`${post.postId}_${version}`" :text="newPostContent" />
        <button type="button" v-on:click="postReply" data-toggle="reply-form" :data-target="`comment-${post.postId}-reply-form`">Submit</button>
        <button type="button" v-on:click="reply" data-toggle="reply-form" :data-target="`comment-${post.postId}-reply-form`">Cancel</button>
      </div>
      <!-- Reply form end -->
    </div>
    <div class="replies">
      <Post @reloadPost="reloadPost" :key="`${child.postId}`" v-for="child in children" :thread="thread" :postId="child.postId" :recPost="child" v-if="children" />
    </div>
  </details>
</template>

<script>
import { DateTime } from 'luxon';
import { VOTE, addPost } from '../lib/queries.js';

import TextEditor from './TextEditor.vue';

export default {
    name: 'Post',
    components: {
        TextEditor,
    },
    props: [
        'thread',
        'postId',
        'recPost',
        'versionMap',
    ],
    data: function() {
        return {
            newPostContent: '',
            version: 0,
            open: true,
        }
    },
    computed: {
        detailsInfo: function() {
            const num = this.post.children ? this.post.children.length : 0;
            const text = this.open ? '-' : `show ${num + 1}`;
            return ` [${text}]`;
        },
        post: function() {
            if (this.recPost) {
                return this.recPost;
            }
            return this.thread.get(this.postId);
        },
        children: function() {
            if (this.recPost) {
                return this.recPost.children;
            }
            return this.thread.childIds(this.postId);
        },
    },
    methods: {
        details: function(event) {
            this.open = event.currentTarget.getAttribute('open') === null;
        },
        ago: function(millis) {
            return DateTime.fromMillis(millis).toRelative();
        },
        reply: function(event) {
            var target = event.target;
            var replyForm;
            if (target.matches("[data-toggle='reply-form']")) {
                replyForm = document.getElementById(target.getAttribute("data-target"));
                replyForm.classList.toggle("d-none");
                replyForm.getElementsByTagName("textarea")[0].focus();
            }
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
