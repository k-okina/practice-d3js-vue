<template>
  <svg ref="targetSvg">
    <g></g>
  </svg>
</template>

<script lang="ts">
import * as d3 from 'd3';
import { Component, Prop, Vue } from 'vue-property-decorator';

type Step = {
  y: number;
};

type Hazard = boolean;

type DataStructure = {
  steps: Step[];
  hazard: Hazard[];
  hazardDescriptionn: string;
  startDate: Date;
};

const getYear = (date: Date): string => {
  const format = 'YYYY年'.replace(/YYYY/, String(date.getFullYear()));
  return format.replace(/MM/, String(date.getMonth()));
};
const getMonth = (date: Date): string => {
  const format = 'MM月'.replace(/YYYY/, String(date.getFullYear()));
  return format.replace(/MM/, String(date.getMonth()));
};
const generateDatesBySteps = (steps: Step[], date: Date): Date[] => {
  return steps.map((d, i) => new Date(date.getFullYear(), date.getMonth() + i));
};

@Component
export default class LineGraph extends Vue {
  @Prop({default: 600}) public width!: number;
  @Prop({default: 240}) public height!: number;
  @Prop({default: '#229439'}) public lineColor!: string;
  @Prop({default: '#2ab345'}) public filterColor!: string;

  public mounted() {
    const steps: Step[] = d3.range(120).map((d, i) => ({
      y: Math.random(),
    }));

    const hazard: Hazard[] = steps.map((d) => d.y > 0.3);

    const dataset: DataStructure = {
      steps,
      hazard,
      hazardDescriptionn: '転職しそうな時期です',
      startDate: new Date(2017, 1, 1),
    };

    this.renderGraph(this.$refs.targetSvg as Element, dataset);
  }

  private renderGraph(elm: Element, dataset: DataStructure) {
    const margin = {top: 0, right: 30, bottom: 0, left: 30};
    const period = 12; // 期間は12年
    const screenWidth = this.width; // スクロールなしの1画面幅
    const scrollWidth = screenWidth * period;
    const axisBottomHeight = 50; // axis bottomにはtextが書いてあり、その高さを考慮しないとtextが描画領域内に収まらない
    const height = this.height - margin.top - margin.bottom - axisBottomHeight;

    const svg = d3.select(elm)
      .attr('width', this.width)
      .attr('height', this.height);

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


    // xscaleはlength - 1。0からカウント
    const xScale = d3
      .scaleLinear()
      .domain([0, dataset.steps.length - 1])
      .range([0, scrollWidth - margin.left - margin.right]);
    const yScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // 描画領域を作成
    const stage = svg.select('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // 曲線グラフを作成
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y((d: any) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    stage.append('path')
      .datum(dataset.steps)
      .attr('class', 'line')
      .attr('stroke', this.lineColor)
      .attr('d', line as any);

    // x補助目盛線を作成
    const dates = generateDatesBySteps(dataset.steps, dataset.startDate);
    const months = dates.map(getMonth);
    const years = dates.map(getYear);

    const monthXAxis = d3
      .axisBottom(xScale)
      .ticks(dates.length)
      .tickFormat((d, i) => months[i])
      .tickSizeOuter(0)
      .tickPadding(10);

    const yearXAxis = d3
      .axisBottom(xScale)
      .ticks(dates.length)
      .tickFormat((d, i) => years[i])
      .tickSizeInner(0)
      .tickSizeOuter(0)
      .tickPadding(10);

    stage
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`)
      .call(monthXAxis as any);

    stage
      .append('g')
      .attr('class', 'x axis sub')
      .attr('transform', `translate(0, ${height + 20})`)
      .call(yearXAxis as any);

    // y補助目盛線を作成
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickSizeInner(-scrollWidth);

    stage
      .append('g')
      .attr('class', 'y axis')
      .call(yAxis as any);

    // ハザード領域を表示
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const hazardData = dataset.hazard.map((data) => data ? 'true' : '');
    const hazardXScale = d3
      .scaleBand()
      .domain(hazardData)
      .range([0, scrollWidth - margin.left - margin.right]);
    const hazardStage = stage.append('g').selectAll('rect').remove().data(hazardData);
    const rectWidth = scrollWidth / dataset.hazard.length;
    const rectHalfWidth = rectWidth / 2;
    hazardStage
      .enter()
      .append('rect')
      .merge(hazardStage)
      .attr('y', margin.bottom)
      .attr('x', (d, i) => i * rectWidth - rectHalfWidth)
      .attr('width', rectWidth)
      .attr('height', (d) => Boolean(d) ? height : 0)
      .attr('fill', this.filterColor)
      .style('opacity', 0.2);
  }
}
</script>

<style lang="scss">
.line {
  fill: none;
  stroke-width: 5px;
}

.axis path,
.axis line {
  fill: none;
  stroke: #878a93;
}

.y.axis {
  text,
  path {
    display: none;
  }
}

.x.axis.sub path {
  display: none;
}
</style>
