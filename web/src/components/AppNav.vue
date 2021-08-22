<template>
  <nav class="menu">
    <ul>
      <li>content sieve</li>
      <li>
        <router-link
          to="/tag/all"
          class="nav-item nav-link"
          active-class="active"
          exact
          >posts</router-link>
      </li>
      <li>
        <router-link
          to="/tree"
          class="nav-item nav-link"
          active-class="active"
          exact
          >full tree</router-link>
      </li>
      <li>
        <router-link
          to="/new"
          class="nav-item nav-link"
          active-class="active"
          exact
          >new</router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {}
</script>

<style scoped>
nav.menu {
  border-bottom: 1px solid black;
}

nav.menu ul {
  list-style-type: none;
  padding-left: 0;
}

nav.menu li {
  display: inline-block;
}

nav.menu li a::before {
  display: inline-block;
  content: '|';
  font-size: 80%;
  font-weight: bold;
  padding: 0 5px;
}
</style>
