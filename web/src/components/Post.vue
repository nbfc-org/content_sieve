<template>
<details open class="comment" :style="`margin-left: ${post.index.split(':').length * 2}em;`" :id="`comment-${post.id}`">
  <a :href="`#comment-${post.id}`" class="comment-border-link">
    <span class="sr-only">Jump to {{ post.id }}</span>
  </a>
  <summary>
    <div class="comment-heading">
      <div class="comment-voting">
        <button type="button">
          <span aria-hidden="true">&#9650;</span>
          <span class="sr-only">Vote up</span>
        </button>
        <button type="button">
          <span aria-hidden="true">&#9660;</span>
          <span class="sr-only">Vote down</span>
        </button>
      </div>
      <div class="comment-info">
        <a href="#" class="comment-author">someguy14</a>
        <p class="m-0">
          22 points
          &bull; <a :href="`#comment-${post.parent}`">#parent</a>
          &bull; {{ new Date(post.createdAt) }}
          &bull; {{ post.index }}
        </p>
      </div>
    </div>
  </summary>

  <div class="comment-body">
    <p>
      {{ post.content.url ? post.content.title : post.content.body }}
    </p>
    <button type="button" v-on:click="reply" data-toggle="reply-form" :data-target="`comment-${post.id}-reply-form`">Reply</button>
    <button type="button">Flag</button>

    <!-- Reply form start -->
    <div class="reply-form d-none" :id="`comment-${post.id}-reply-form`">
      <textarea v-model="newPostContent" placeholder="Reply to comment" rows="4"></textarea>
      <button type="button" v-on:click="addPost" data-toggle="reply-form" :data-target="`comment-${post.id}-reply-form`">Submit</button>
      <button type="button" v-on:click="reply" data-toggle="reply-form" :data-target="`comment-${post.id}-reply-form`">Cancel</button>
    </div>
    <!-- Reply form end -->
  </div>
  <div class="replies">
    <Post @postReply="postReply" :key="`${child}_${childrenCount}`" v-for="child in children" :thread="thread" :postId="child" v-if="children" />
  </div>
</details>
</template>

<script>
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
            }
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
