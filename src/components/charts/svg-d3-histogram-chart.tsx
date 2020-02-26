import * as ReactFauxDOM from "react-faux-dom";
import * as d3 from "d3";
import { ChartType } from "../../stores/charts-store";

interface IProps {
  chart: ChartType;
  chartMin: number;
  chartMax: number;
  width: number;
  height: number;
  showBars: boolean;
}

export const SvgD3HistogramChart = (props: IProps) => {
  const { width, height, chart, showBars, chartMin, chartMax } = props;
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
  const axisBottom = d3.axisBottom(xScale);
  svg.append("g")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(axisBottom);

  const xDomain: number[] = xScale.domain();
  const histogram = d3.histogram<number, number>()
    .domain([ xDomain[0], xDomain[1] ])
    .thresholds(xScale.ticks(numBins));

  // And apply this function to data to get the bins
  const bins = histogram(data as number[]);
  let max = 0;
  bins.forEach(bin => {
    max = Math.max(max, bin.length);
  });
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
  if (!showBars) {
    bins.forEach((bin, binIndex) => {
      const binMap = bin.map((x, i) => i);
      svg.append("g")
        .selectAll("dot")
        .data(binMap)
        .enter()
        .append("circle")
          .attr("cx", d => (xScale(binIndex) * 10 + (chartWidth / numBins * .45)) )
          .attr("cy", d => (yScale(d) - 5) )
          .attr("r", chartWidth / numBins * .45)
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

  return div.toReact();
};
