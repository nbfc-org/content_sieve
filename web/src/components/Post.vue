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
          22 points
          &bull; <router-link
            :to="`/post/${post.parent.postId}`"
            class="nav-item nav-link"
            active-class="active"
            exact
            v-if="post.parent"
            >parent</router-link>
          &bull; {{ post.index }}
          &bull; {{ post.votes }}
          &bull; {{ new Date(post.createdAt) }}
        </p>
      </div>
    </div>
  </summary>

  <div class="comment-body">
    <p>
      {{ post.content.url ? post.content.title : post.content.body }}
    </p>
    <button type="button" v-on:click="reply" data-toggle="reply-form" :data-target="`comment-${post.postId}-reply-form`">Reply</button>
    <button type="button" v-on:click="flag">Flag</button>

    <!-- Reply form start -->
    <div class="reply-form d-none" :id="`comment-${post.postId}-reply-form`">
      <textarea v-model="newPostContent" placeholder="Reply to comment" rows="4"></textarea>
      <button type="button" v-on:click="addPost" data-toggle="reply-form" :data-target="`comment-${post.postId}-reply-form`">Submit</button>
      <button type="button" v-on:click="reply" data-toggle="reply-form" :data-target="`comment-${post.postId}-reply-form`">Cancel</button>
    </div>
    <!-- Reply form end -->
  </div>
  <div class="replies">
    <Post @postReply="postReply" :key="`${child}_${childrenCount}`" v-for="child in children" :thread="thread" :postId="child" v-if="children" />
  </div>
</details>
</template>

<script>
import { VOTE } from '../lib/queries.js';
export default {
    name: 'Post',
    props: ['thread', 'postId'],
    data: function() {
        return {
            newPostContent: '',
        }
    },
    computed: {
        post: function() {
            return this.thread.get(this.postId);
        },
        children: function() {
            return this.thread.childIds(this.postId);
        },
        childrenCount: function() {
            return this.thread.childrenCount(this.postId);
        },
    },
    methods: {
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
                });
                console.info(w);
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
        postReply: function(event, parent, text) {
            this.$emit('postReply', event, parent, text);
        },
        addPost: function(event) {
            this.$emit('postReply', event, this.post, this.newPostContent);
            this.newPostContent = '';
            this.reply(event);
        },
   },
}
</script>
