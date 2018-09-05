<template>
  <div class="home">
    <LineGraph/>
    <LineGraph>
      <button slot="left">leftボタン</button>
      <button slot="right">rightボタン</button>
    </LineGraph>
    <LineGraph/>
    <!-- <AppCircle/> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// import AppCircle from '@/components/AppCircle.vue'; // @ is an alias to /src
// import PrettyGraph from '@/components/PrettyGraph.vue'; // @ is an alias to /src
import LineGraph from '@/components/LineGraph.vue';

@Component({
  components: {
    LineGraph,
    // AppCircle,
  },
})
export default class Home extends Vue {}
</script>
