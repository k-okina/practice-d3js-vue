<template>
  <div class="home">
    <!-- <PrettyGraph msg="Welcome to Your Vue.js + TypeScript App"/> -->
    <AppCircle/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import AppCircle from '@/components/AppCircle.vue'; // @ is an alias to /src
// import PrettyGraph from '@/components/PrettyGraph.vue'; // @ is an alias to /src

@Component({
  components: {
    // PrettyGraph,
    AppCircle,
  },
})
export default class Home extends Vue {}
</script>
