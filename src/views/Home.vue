<template>
  <div class="home">
    <LineGraph :dataset="dataset"/>
    <LineGraph :dataset="dataset" :defaultX="-500" :width="300" :height="200">
      <button slot="left">leftボタン</button>
      <button slot="right">rightボタン</button>
    </LineGraph>
    <LineGraph :dataset="dataset" :period="1"/>
    <!-- <AppCircle/> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// import AppCircle from '@/components/AppCircle.vue'; // @ is an alias to /src
// import PrettyGraph from '@/components/PrettyGraph.vue'; // @ is an alias to /src
import LineGraph from '@/components/LineGraph.vue';

const steps: Step[] = [...Array(120)].map((d, i) => ({
  y: Math.random(),
}));
const hazard: Hazard[] = steps.map((d) => d.y > 0.3);
const dataset: DataStructure = {
  steps,
  hazard,
  hazardDescriptionn: '転職しそうな時期です',
  startDate: new Date(2017, 1, 1),
};

@Component({
  components: {
    LineGraph,
    // AppCircle,
  },
})
export default class Home extends Vue {
  private dataset: DataStructure = dataset;
}
</script>
