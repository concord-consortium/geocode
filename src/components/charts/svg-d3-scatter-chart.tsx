import * as ReactFauxDOM from "react-faux-dom";
import * as d3 from "d3";
import { IPoint } from "./canvas-d3-scatter-chart";

interface IProps {
  data: IPoint[];
  width: number;
  height: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const SvgD3ScatterChart = (props: IProps) => {
  const { width, height, data, xAxisLabel, yAxisLabel } = props;

  const margin = {top: 20, right: 20, bottom: 30, left: 50};
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const div = new ReactFauxDOM.Element("div");

  const svg = d3.select(div).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const xScale = d3.scaleLinear()
    .domain([0, Math.max(...data.map(d => d.x))])
    .range([ 0, chartWidth ]);
  const yScale = d3.scaleLinear()
    .domain([0, Math.max(...data.map(d => d.y))])
    .range([ chartHeight, 0]);

  // add axes
  svg.append("g")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .call(d3.axisLeft(yScale));

  // Add labels
  if (xAxisLabel) {
    svg.append("text")
    .attr("x", `${width / 2}`)
    .attr("y", `${height - 20}`)
    .text(xAxisLabel);
  }
  if (yAxisLabel) {
    svg.append("text")
      .attr("x", `-${height / 2}`)
      .attr("dy", "-30px")
      .attr("transform", "rotate(-90)")
      .text(yAxisLabel);
  }

  svg.append("g")
    .selectAll("dot")
    .data(props.data)
    .enter()
    .append("circle")
      .attr("cx", d => xScale(d.x) )
      .attr("cy", d => yScale(d.y) )
      .attr("r", 1.5)
      .style("fill", "#3c7769");

  return div.toReact();
};