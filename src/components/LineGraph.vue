<template>
  <div class="root-elm" :style="{width: `${width}px`, height: `${height}px`}">
    <svg ref="targetSvg">
      <g ref="mainStage" :transform="`translate(${x}, ${y})`"></g>
    </svg>
    <div
      @mousedown="keepMoveLeft"
      @mouseup="clearKeepDown"
      @mouseout="clearKeepDown"
      class="controller left"
      :style="controllerStyle"
    >left</div>
    <div
      @mousedown="keepMoveRight"
      @mouseup="clearKeepDown"
      @mouseout="clearKeepDown"
      class="controller right"
      :style="controllerStyle"
    >right</div>
  </div>
</template>

<script lang="ts">
import * as d3 from 'd3';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { setInterval, clearInterval } from 'timers';

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

const margin = {top: 0, right: 30, bottom: 0, left: 30};

@Component
export default class LineGraph extends Vue {
  @Prop({default: 600}) public width!: number; // スクロールなしの1画面幅
  @Prop({default: 240}) public height!: number;
  @Prop({default: '#229439'}) public lineColor!: string;
  @Prop({default: '#2ab345'}) public filterColor!: string;
  private x = margin.left;
  private y = margin.top;
  private vx = 5;
  private keepDown: NodeJS.Timer|null = null;
  private margin = margin;
  private period = 12; // 期間は12年
  private axisBottomHeight = 50; // axis bottomにはtextが書いてあり、その高さを考慮しないとtextが描画領域内に収まらない

  get lineGraphHeight() {
    return (this.height - this.axisBottomHeight) / 2;
  }

  get scrollWidth() {
    return this.width * this.period;
  }

  // 右側の行き止まり スクロールなしならこの値は0になるべき
  get rightLimit() {
    return this.scrollWidth - this.width - this.margin.left;
  }

  // 右側の行き止まり
  get leftLimit() {
    return this.margin.left;
  }

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

  get controllerStyle() {
    return { top: `${this.lineGraphHeight}px`};
  }

  private keepMoveRight() {
    this.keepDown = setInterval(() => {
      if (this.x - this.vx <= -this.rightLimit) {
        // 移動範囲を制限
        // 右端に達したなら停止
        this.x = -this.rightLimit;
        this.clearKeepDown();
      } else {
        // スクロール範囲内なら移動
        this.x -= this.vx;
      }
    }, 1);
  }

  private keepMoveLeft() {
    this.keepDown = setInterval(() => {
      if (this.x >= this.leftLimit) {
        // 移動範囲を制限
        // 左端に達したなら停止
        this.x = this.margin.left;
        this.clearKeepDown();
      } else {
        // スクロール範囲内なら移動
        this.x += this.vx;
      }
    }, 1);
  }

  private clearKeepDown() {
    clearInterval(this.keepDown as NodeJS.Timer);
  }

  private renderGraph(elm: Element, dataset: DataStructure) {
    const scrollWidth = this.width * this.period;
    const height = this.height - this.margin.top - this.margin.bottom - this.axisBottomHeight;

    const svg = d3.select(elm)
      .attr('width', this.width)
      .attr('height', this.height);

    // xscaleはlength - 1。0からカウント
    const xScale = d3
      .scaleLinear()
      .domain([0, dataset.steps.length - 1])
      .range([0, scrollWidth - this.margin.left - this.margin.right]);
    const yScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // 描画領域を作成
    const stage = svg.select('g');

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
      .range([0, scrollWidth - this.margin.left - this.margin.right]);
    const hazardStage = stage.append('g').selectAll('rect').remove().data(hazardData);
    const rectWidth = scrollWidth / dataset.hazard.length;
    const rectHalfWidth = rectWidth / 2;
    hazardStage
      .enter()
      .append('rect')
      .merge(hazardStage)
      .attr('y', this.margin.bottom)
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

.root-elm {
  position: relative;
}

.controller {
  position: absolute;
  transform: translateY(-50%);

  &.left {
    left: 0;
  }

  &.right {
    right: 0;
  }
}
</style>
