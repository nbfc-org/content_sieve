<template>
  <v-app-bar app dense>
    <v-toolbar-title>
      <v-btn to="/" exact>content sieve</v-btn>
    </v-toolbar-title>
    <v-spacer/>
    <v-toolbar-items>
      <v-btn to="/tag/all" small exact>posts</v-btn>
      <v-btn to="/tree" small exact>full tree</v-btn>
      <v-btn to="/new" small exact>new</v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
export default {}
</script>
