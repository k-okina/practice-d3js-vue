<template>
  <svg ref="targetSvg" :width="width" :height="height" style="background: lightgoldenrodyellow"></svg>
</template>

<script lang="ts">
import * as d3 from 'd3';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { setTimeout } from 'timers';
import { copyFile } from 'fs';

function format(date: Date): string {
  const format = 'YYYY年MM月'.replace(/YYYY/, String(date.getFullYear()));
  return format.replace(/MM/, String(date.getMonth() + 1));
}

type GraphData = {
  x: number;
  y: number;
}

type Range = {
  index: number[];
  description: string;
}

type DataStructure = {
  steps: GraphData[];
  ranges: Range[];
};

@Component
export default class LineGraph extends Vue {
  @Prop({default: 600}) width!: number;
  @Prop({default: 240}) height!: number;

  public mounted() {
    const steps: GraphData[] = d3.range(120).map((d, i) => ({
      x: i * 10,
      y: Math.random(),
    }));

    const ranges: Range[] = [{
      index: [0, 1],
      description: 'ここにいる人は10人中1人は転職してます。',
    }];

    const dataset: DataStructure = {
      steps,
      ranges,
    };

    this.renderGraph(this.$refs.targetSvg as Element, dataset, new Date(2017));
  }

  private renderGraph(elm: Element, dataset: DataStructure, startDate: Date) {
    // 2. Use the margin convention practice
    const margin = {top: 0, right: 10, bottom: 50, left: 10};
    const period = 2; // 期間は12年
    const width = this.width;
    const scrollWidth = width * period - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;
    const xScale = d3.scaleLinear()
      .domain([0, dataset.steps.length])
      .range([0, scrollWidth + width]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);
    const svg = d3.select(elm);

    svg.attr('cursor', 'move');

    // 描画領域を作成
    const stage = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 曲線グラフを作成
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y((d: any) => yScale(d.y))
      .curve(d3.curveMonotoneX);
    stage.append('path').datum(dataset.steps).attr('class', 'line').attr('d', line as any);

    // 補助目盛線を作成
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d, i) => {
        console.log(d, i);
        return `${d} 年`;
      });

    stage
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis as any);

    // ズームイベントリスナーの設定
    const zoom = d3.zoom()
      .on('zoom', () => {
          const t = d3.event.transform; //マウスの移動量を取得
          console.log(t.x);
          let tx = null;

          //移動範囲を制限
          if (t.x <= -scrollWidth - margin.left - margin.right) { //右端の最大移動量を設定
            tx = -scrollWidth;
            t.x = -scrollWidth;
          } else if (t.x >= 0) { //左端の最大移動量を設定
            tx = margin.left;
            t.x = margin.left;
          } else {
            tx = t.x;
          }

          //マウスに移動量に合わせてステージを移動
          stage.attr('transform', `translate(${tx}, 0)`);
      });

    //ズームイベントリスナーをsvgに設置
    svg.call(zoom);
  };
}
</script>

<style>
.line {
    fill: none;
    stroke: #ffab00;
    stroke-width: 3;
}
</style>
