<template>
  <svg :width="width" :height="height"></svg>
</template>

<script lang="ts">
import * as d3 from 'd3';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { setTimeout } from 'timers';

@Component
export default class AppCircle extends Vue {
  @Prop({default: 600}) width!: number;
  @Prop({default: 240}) height!: number;

  mounted() {
    const data = [40, 15, 20, 30];
    const draw = (dataSet: Array<Number>) => {
      const circles = d3.select('svg').selectAll('circle').data(dataSet);
      return circles
        .enter()
        .append('circle')
        .merge(circles)
        .attr('cx', (d, i) => i * 50 + 50)
        .attr('cy', this.height / 2)
        .attr('r', d => String(d))
        .attr('fill', 'pink')
        .attr('cursor', 'pointer')
    }
    draw(data);
    setTimeout(() => draw([20, 90]), 1000);
  };
}
</script>
