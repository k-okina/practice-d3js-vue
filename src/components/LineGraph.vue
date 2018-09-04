<template>
  <svg ref="targetSvg" :width="width" :height="height" style="background: lightgoldenrodyellow"></svg>
</template>

<script lang="ts">
import * as d3 from 'd3';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { setTimeout } from 'timers';

type GraphData = {
  date: Date;
  y: number;
}

type Range = {
  dates: Date[];
  description: string;
}

type Point = {
  date: Date;
  description: string;
}

type DataStructure = {
  graph: GraphData[];
  ranges: Range[];
  points: Point[];
};

@Component
export default class LineGraph extends Vue {
  @Prop({default: 600}) width!: number;
  @Prop({default: 240}) height!: number;

  mounted() {
    const graph: GraphData[] = [0.14, 0.18, 0.37, 0.25, 0.38, 0.41].map((d, i) => {
      const date = new Date();
      date.setDate(i + 1);
      return { date, y: d };
    });

    const ranges: Range[] = [{
      dates: [graph[1].date, graph[3].date],
      description: 'ここにいる人は10人中1人は転職してます。',
    }];

    const points: Point[] = [{
      date: graph[2].date,
      description: 'ここにいる人は2人に1人は転職してます。',
    }];

    const dataset: DataStructure = {
      graph,
      ranges,
      points,
    };

    // 2. Use the margin convention practice
    const margin = {top: 50, right: 10, bottom: 50, left: 10};
    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    // 5. X scale will use the index of our data
    const xScale = d3.scaleLinear()
        .domain([0, dataset.graph.length - 1]) // input
        .range([0, width]); // output

    // 6. Y scale will use the randomly generate number
    const yScale = d3.scaleLinear()
        .domain([0, 1]) // input
        .range([height, 0]); // output

    // 7. d3's line generator
    const line = d3.line()
        .x((d, i) => xScale(i)) // set the x values for the line generator
        .y((d: any) => yScale(d.y)) // set the y values for the line generator
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    // 1. Add the SVG to the page and employ #2
    const svg = d3
      .select(this.$refs.targetSvg as Element)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 3. Call the x axis in a group tag
    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale) as any); // Create an axis component with d3.axisBottom

    // 9. Append the path, bind the data, and call the line generator
    svg
      .append('path')
      .datum(dataset.graph) // 10. Binds data to the line
      .attr('class', 'line') // Assign a class for styling
      .attr('d', line as any); // 11. Calls the line generator
  };
}
</script>

<style>
.line {
    fill: none;
    stroke: #ffab00;
    stroke-width: 3;
}

.overlay {
  fill: none;
  pointer-events: all;
}

.dot {
    fill: #ffab00;
    stroke: #fff;
}

.focus circle {
  fill: none;
  stroke: steelblue;
}
</style>
