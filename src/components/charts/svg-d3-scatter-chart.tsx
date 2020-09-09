import * as ReactFauxDOM from "react-faux-dom";
import * as d3 from "d3";
import { ChartType } from "../../stores/charts-store";

type Scale = d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;

interface IProps {
  chart: ChartType;
  width: number;
  height: number;
}

export const SvgD3ScatterChart = (props: IProps) => {
  const { width, height, chart } = props;
  const { data, xAxisLabel, yAxisLabel, fadeIn } = chart;

  const margin = {top: 15, right: 20, bottom: 43, left: 50};
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const div = new ReactFauxDOM.Element("div");

  const svg = d3.select(div).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const xScale: Scale = chart.isDate(0) ? d3.scaleTime() : d3.scaleLinear();
  xScale.rangeRound([0, chartWidth]).domain(chart.extent(0));
  xScale.nice();

  const yScale: Scale = chart.isDate(1) ? d3.scaleTime().nice() : d3.scaleLinear();
  yScale.rangeRound([chartHeight, 0]).domain(chart.extent(1));

  // add axes
  const axisBottom = chart.isDate(0) ?
      d3.axisBottom(xScale).tickFormat(chart.toDateString()) :
      d3.axisBottom(xScale);
  svg.append("g")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(axisBottom);

  const axisLeft = chart.isDate(1) ?
    d3.axisLeft(yScale).tickFormat(chart.toDateString()) :
    d3.axisLeft(yScale);
  svg.append("g")
    .call(axisLeft);

  // Add labels
  if (xAxisLabel) {
    svg.append("text")
      .attr("x", `${chartWidth / 2}`)
      .attr("y", `${height - 20}`)
      .style("text-anchor", "middle")
      .style("font-size", "0.9em")
      .style("fill", "#555")
      .text(xAxisLabel);
  }
  if (yAxisLabel) {
    svg.append("text")
      .attr("x", `-${height / 2}`)
      .attr("dy", "-30px")
      .attr("transform", "rotate(-90)")
      .style("font-size", "0.9em")
      .style("fill", "#555")
      .text(yAxisLabel);
  }

  const colorLerp = (d3.scaleLinear().domain([0, data.length]) as any).range(["white", "#448878"]);
  const color = fadeIn ?
    (d: number, i: number) => colorLerp(i) :
    "#448878";

  svg.append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", d => xScale((d as number[] | Date[])[0]) )
      .attr("cy", d => yScale((d as number[] | Date[])[1]) )
      .attr("r", 1.5)
      .style("fill", (color as any));

  return div.toReact();
};
