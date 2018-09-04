<template>
  <svg ref="targetSvg" :width="width" :height="height" style="background: gray"></svg>
</template>

<script lang="ts">
import * as d3 from 'd3';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { setTimeout } from 'timers';

type Data = {
  name: string;
  score: number;
};

@Component
export default class PrettyGraph extends Vue {
  @Prop({default: 600}) private width!: number;
  @Prop({default: 240}) private height!: number;

  public mounted() {
    const draw = (dataSet: Data[]) => {
      const padding = {
        top: 40,
        bottom: 40,
        left: 100,
        right: 40,
      };

      const elm = this.$refs.targetSvg as Element;
      d3.select(elm).selectAll('rect').remove();
      const bars = d3.select(elm).selectAll('rect').data(dataSet);
      const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(dataSet, (d) => d.score) as number])
        .range([0, this.width - padding.left - padding.right])
        .nice();

      const yScale = d3
        .scaleBand()
        .domain(dataSet.map((data) => data.name))
        .range([0, this.height - padding.top - padding.bottom])
        .padding(0.1);

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      bars
        .enter()
        .append('rect')
        .merge(bars)
        .attr('x', padding.left)
        .attr('y', (d, i) => yScale(d.name) as number + padding.top)
        .attr('width', 0)
        .attr('height', yScale.bandwidth())
        .attr('fill', (d, i) => color(String(i)))
        .transition()
        .duration(450)
        .delay((d, i) => i * 200)
        .ease(d3.easeElastic)
        .attr('width', (d) => xScale(d.score));

      d3
        .select(elm)
        .selectAll('.axis')
        .remove();

      d3
        .select(elm)
        .append('g')
        .call(d3.axisBottom(xScale) as any)
        .attr('class', 'axis')
        .attr('transform', `translate(${padding.left}, ${this.height - padding.bottom})`);

      d3
        .select(elm)
        .append('g')
        .call(d3.axisLeft(yScale) as any)
        .attr('class', 'axis')
        .attr('transform', `translate(${padding.left}, ${padding.top})`);
    };
    draw([
      {name: 'taguchi', score: 717},
      {name: 'fkoji', score: 920},
      {name: 'tanaka', score: 120},
      {name: 'takkun', score: 999},
      {name: 'dotinstall', score: 618},
    ]);
    setTimeout(() => {
      draw([
        {name: 'taguchi', score: 717},
        {name: 'fkoji', score: 920},
      ]);
    }, 1000);
  }
}
</script>
