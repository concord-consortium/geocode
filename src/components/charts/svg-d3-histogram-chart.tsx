import * as ReactFauxDOM from "react-faux-dom";
import * as d3 from "d3";
import { ChartType } from "../../stores/charts-store";

interface IProps {
  chart: ChartType;
  chartMin: number;
  chartMax: number;
  width: number;
  height: number;
  threshold: number;
  showBarHistogram: boolean;
}

export const SvgD3HistogramChart = (props: IProps) => {
  const { width, height, chart, chartMin, chartMax, threshold, showBarHistogram } = props;
  const { data, xAxisLabel, yAxisLabel } = chart;

  const margin = {top: 15, right: 20, bottom: 35, left: 50};
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const numBins = 40;

  const div = new ReactFauxDOM.Element("div");

  const svg = d3.select(div).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const xScale = d3.scaleLinear();
  xScale.domain([chartMin, chartMax]);
  xScale.range([0, chartWidth]);

  // add axes
  const axisBottom = d3.axisBottom(xScale).tickFormat(x => (x === chartMax) ? `${x}+` : `${x}`);
  svg.append("g")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(axisBottom);

  const xDomain: number[] = xScale.domain();
  const histogram = d3.histogram<number, number>()
    .domain([ xDomain[0], xDomain[1] ])
    .thresholds(xScale.ticks(numBins));

  // Add all the cases exceeding the max into the max's bin
  const bins = histogram((data as number[]).map(d => Math.min(d, xDomain[1] - 1)));
  let binMax = 0;
  bins.forEach(bin => {
    binMax = Math.max(binMax, bin.length);
  });
  // if the binMax is small and will result in excess vertical space,
  // increase the y max so dots will stack directly on top of one another
  const radius = Math.min(chartWidth / numBins * .45, chartHeight / binMax * .45);
  const max = chartHeight / binMax * .45 > chartWidth / numBins * .45
              ? Math.floor(chartHeight / radius * .45)
              : binMax;

  const yScale = d3.scaleLinear();
  yScale.range([chartHeight, 0]);
  yScale.domain([0, max]);

  const axisLeft = d3.axisLeft(yScale);
  svg.append("g")
    .call(axisLeft);

  // Add labels
  if (xAxisLabel) {
    svg.append("text")
      .attr("x", `${width / 3}`)
      .attr("y", `${height - margin.top - 2}`)
      .style("font-size", "0.9em")
      .style("fill", "#555")
      .text(xAxisLabel);
  }
  if (yAxisLabel) {
    svg.append("text")
      .attr("x", `-${2 * height / 3}`)
      .attr("dy", "-30px")
      .attr("transform", "rotate(-90)")
      .style("font-size", "0.9em")
      .style("fill", "#555")
      .text(yAxisLabel);
  }
  if (!showBarHistogram) {
    const dotRadius = Math.min(chartWidth / numBins * .45, chartHeight / max * .45);
    bins.forEach((bin) => {
      const binMap = bin.map((x, i) => i);
      svg.append("g")
        .selectAll("dot")
        .data(binMap)
        .enter()
        .append("circle")
          .attr("cx", d => (1 + xScale(bin.x0 as number) + dotRadius) )
          .attr("cy", d => (yScale(d) - dotRadius) )
          .attr("r", dotRadius)
          .style("fill", "#448878");
    });
  } else {
    svg.selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
      .attr("x", 1)
      .attr("transform", d => "translate(" + xScale(d.x0 as number) + "," + (yScale(d.length)) + ")")
      .attr("width", d => (Math.max(0, xScale(d.x1 as number) - xScale(d.x0 as number) - 1)))
      .attr("height", d => (chartHeight - yScale(d.length)))
      .style("fill", "#448878");
  }

  const thresholdX = threshold / (chartMax - chartMin) * chartWidth;
  svg.append("line")
    .attr("x1", thresholdX)
    .attr("y1", 0)
    .attr("x2", thresholdX)
    .attr("y2", chartHeight)
    .attr("stroke", "#4AA9FF")
    .attr("stroke-width", 3);
  svg.append("text")
    .attr("x", thresholdX)
    .attr("y", -3)
    .attr("text-anchor", "middle")
    .style("font-size", "0.8em")
    .style("font-weight", "bold")
    .style("fill", "#4AA9FF")
    .text(threshold.toString());

  return div.toReact();
};
