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

type Hazard = boolean;

type DataStructure = {
  steps: GraphData[];
  hazard: Hazard[];
  hazardDescriptionn: string;
};

const generateDatesBySteps = (steps: GraphData[], date: Date): string[] => {
  return steps.map((d, i) => format(new Date(date.getFullYear(), date.getMonth() + i)));
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

    const hazard: Hazard[] = steps.map((d) => d.y > 0.2);

    const dataset: DataStructure = {
      steps,
      hazard,
      hazardDescriptionn: '転職しそうな時期です',
    };

    this.renderGraph(this.$refs.targetSvg as Element, dataset, new Date(2017, 1, 1));
  }

  private renderGraph(elm: Element, dataset: DataStructure, startDate: Date) {
    // 2. Use the margin convention practice
    const margin = {top: 0, right: 10, bottom: 50, left: 10};
    const period = 12; // 期間は12年
    const width = this.width;
    const scrollWidth = width * period;
    const height = this.height - margin.top - margin.bottom;
    const xScale = d3.scaleLinear()
      .domain([0, dataset.steps.length])
      .range([0, scrollWidth]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);
    const svg = d3.select(elm);

    // 描画領域を作成
    const stage = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 曲線グラフを作成
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y((d: any) => yScale(d.y)).curve(d3.curveMonotoneX);
    stage.append('path').datum(dataset.steps).attr('class', 'line').attr('d', line as any);

    // 補助目盛線を作成
    const dates = generateDatesBySteps(dataset.steps, startDate);
    const bottomXScale = d3.scaleBand()
      .domain(dates)
      .range([0, scrollWidth]);
    const xAxis = d3.axisBottom(bottomXScale);

    stage
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis as any);

    // スクロールの設定
    svg.attr('cursor', 'move');
    const zoom = d3.zoom().on('zoom', () => {
      const leftLimit = 0; // 左側の限界値
      const rightLimit = scrollWidth - width; // 右側の限界値 幅が600でスクロールなしならこの値は0になるべき
      const t = d3.event.transform; //マウスの移動量を取得
      let tx = null;

      // 移動範囲を制限
      if (t.x <= -rightLimit) { // 右端に達したなら停止
        t.x = tx = -rightLimit - margin.right;
      } else if (t.x >= leftLimit) { // 左端に達したなら停止
        t.x = tx = margin.left;
      } else { // スクロール範囲内なら移動
        tx = t.x;
      }

      // マウスに移動量に合わせてステージを移動
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
