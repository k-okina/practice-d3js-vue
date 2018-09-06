<template>
  <div class="home">
    <LineGraph :dataset="dataset"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// import AppCircle from '@/components/AppCircle.vue'; // @ is an alias to /src
// import PrettyGraph from '@/components/PrettyGraph.vue'; // @ is an alias to /src
import LineGraph from '@/components/LineGraph.vue';
import Tooltip from '@/components/Tooltip.vue';
import { setInterval } from 'timers';

const steps: Step[] = [...Array(120)].map((d, i) => ({
  y: Math.random(),
}));
const hazard: Hazard[] = steps.map((d) => d.y > 0.3);
const dataset: DataStructure = {
  steps,
  hazard,
  hazardDescription: '転職しそうな時期です',
  startDate: new Date(2017, 1, 1),
};

@Component({
  components: {
    LineGraph,
    Tooltip,
    // AppCircle,
  },
})
export default class Home extends Vue {
  private dataset: DataStructure = dataset;
  private width = 1000;
  private height = 500;

  public mounted() {
    setInterval(() => {
      this.width = Math.random() * 600;
      this.height = this.width / 2;
    }, 1000);
  }
}
</script>

<style lang="scss" scoped>
.home {
  width: 50vw;
  height: 50vh;
}
</style>
