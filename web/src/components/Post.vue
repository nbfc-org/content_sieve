<template>
<details open class="comment" :id="`comment-${post.postId}`">
  <a :href="`#comment-${post.postId}`" class="comment-border-link">
    <span class="sr-only">Jump to {{ post.postId }}</span>
  </a>
  <summary>
    <div class="comment-heading">
      <div class="comment-voting">
        <button type="button" v-on:click="up">
          <span aria-hidden="true">&#9650;</span>
          <span class="sr-only">Vote up</span>
        </button>
        <button type="button" v-on:click="down">
          <span aria-hidden="true">&#9660;</span>
          <span class="sr-only">Vote down</span>
        </button>
      </div>
      <div class="comment-info">
        <a href="#" class="comment-author">{{ post.author.username }}</a>
        <p class="m-0">
          <router-link
            :to="`/post/${post.postId}`"
            class="nav-item nav-link"
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
          &bull; {{ post.votes }}
        </p>
      </div>
    </div>
  </summary>

  <div class="comment-body">
    <p v-if="post.content.url"><a :href="post.content.url">{{ post.content.title }}</a></p>
    <div class="markdown-body" v-else v-html="post.content.rendered" />
    <button type="button" v-on:click="reply" data-toggle="reply-form" :data-target="`comment-${post.postId}-reply-form`">Reply</button>
    <button type="button" v-on:click="flag">Flag</button>

    <!-- Reply form start -->
    <div class="reply-form d-none" :id="`comment-${post.postId}-reply-form`">
      <TextEditor @saveContent="saveContent" :key="`${post.postId}_${newPostContent}`" :text="newPostContent" />
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
        }
    },
    computed: {
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
            this.reply(event);
        },
        reloadPost: function(cache, post) {
            this.$emit('reloadPost', cache, post);
        },
    },
}
</script>
