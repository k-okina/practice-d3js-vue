<template>
  <svg ref="targetSvg"></svg>
</template>

<script lang="ts">
import * as d3 from 'd3';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { setTimeout } from 'timers';
import { copyFile } from 'fs';

type GraphData = {
  y: number;
};

type Hazard = boolean;

type DataStructure = {
  steps: GraphData[];
  hazard: Hazard[];
  hazardDescriptionn: string;
};

const formatDate = (date: Date): string => {
  const format = 'YYYY年MM月'.replace(/YYYY/, String(date.getFullYear()));
  return format.replace(/MM/, String(date.getMonth() + 1));
};

const generateDatesBySteps = (steps: GraphData[], date: Date): string[] => {
  return steps.map((d, i) => formatDate(new Date(date.getFullYear(), date.getMonth() + i)));
};

@Component
export default class LineGraph extends Vue {
  @Prop({default: 600}) public width!: number;
  @Prop({default: 240}) public height!: number;

  public mounted() {
    const steps: GraphData[] = d3.range(120).map((d, i) => ({
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
    const margin = {top: 10, right: 30, bottom: 20, left: 30};
    const period = 12; // 期間は12年
    const screenWidth = this.width; // スクロールなしの1画面幅
    const scrollWidth = screenWidth * period;
    const axisBottomHeight = 20;
    const height = this.height - margin.top - margin.bottom - axisBottomHeight;

    // xscaleはlength - 1。0からカウント
    const xScale = d3
      .scaleLinear()
      .domain([0, dataset.steps.length - 1])
      .range([0, scrollWidth - margin.left - margin.right]);
    const yScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, height]);
    const svg = d3.select(elm)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('style', 'background: lightgoldenrodyellow');

    // 描画領域を作成
    const stage = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 曲線グラフを作成
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y((d: any) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    stage.append('path')
      .datum(dataset.steps)
      .attr('width', scrollWidth)
      .attr('class', 'line')
      .attr('d', line as any);

    // x補助目盛線を作成
    const dates = generateDatesBySteps(dataset.steps, startDate);
    const bottomXScale = d3
      .scaleBand()
      .domain(dates)
      .range([0, scrollWidth - margin.left - margin.right]);

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(dates.length)
      .tickFormat((d, i) => dates[i])
      .tickSizeOuter(0)
      .tickPadding(10);

    stage
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis as any);

    // y補助目盛線を作成
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickSizeInner(-scrollWidth);

    stage
      .append('g')
      .attr('class', 'y axis')
      .call(yAxis as any);

    // スクロールの設定
    svg.attr('cursor', 'move');
    const zoom = d3.zoom().on('zoom', () => {
      const leftLimit = margin.left; // 左側の限界値
      const rightLimit = scrollWidth - screenWidth - margin.left; // 右側の限界値 幅が600でスクロールなしならこの値は0になるべき
      const t = d3.event.transform; // マウスの移動量を取得
      let tx = null;

      // 移動範囲を制限
      if (t.x <= -rightLimit) { // 右端に達したなら停止
        t.x = tx = -rightLimit;
      } else if (t.x >= leftLimit) { // 左端に達したなら停止
        t.x = tx = margin.left;
      } else { // スクロール範囲内なら移動
        tx = t.x;
      }

      // マウスに移動量に合わせてステージを移動
      stage.attr('transform', `translate(${tx}, ${margin.top})`);
    });

    // ズームイベントリスナーをsvgに設置
    svg.call(zoom);
  }
}
</script>

<style lang="scss">
.line {
  fill: none;
  stroke: #ffab00;
  stroke-width: 3;
}

.tick line {
  opacity: 0.2;
}

.axis path,
.axis line {
  fill: none;
  stroke: black;
}

.y.axis {
  text,
  path {
    display: none;
  }
}
</style>
