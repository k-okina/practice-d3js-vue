<template>
  <div class="home">
    <PrettyGraph msg="Welcome to Your Vue.js + TypeScript App"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import PrettyGraph from '@/components/PrettyGraph.vue'; // @ is an alias to /src

@Component({
  components: {
    PrettyGraph,
  },
})
export default class Home extends Vue {}
</script>
