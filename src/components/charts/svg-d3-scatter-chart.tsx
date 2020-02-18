import * as ReactFauxDOM from "react-faux-dom";
import * as d3 from "d3";

interface IProps {
  data: number[][];         // (x,y) tuples: [[x,y], [x,y], ...]
  width: number;
  height: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export const SvgD3ScatterChart = (props: IProps) => {
  const { width, height, data, xAxisLabel, yAxisLabel } = props;

  const margin = {top: 15, right: 20, bottom: 35, left: 50};
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const div = new ReactFauxDOM.Element("div");

  const svg = d3.select(div).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const xScale = d3.scaleLinear()
    .domain([0, Math.max(...data.map(d => d[0]))])
    .range([ 0, chartWidth ]);
  const yScale = d3.scaleLinear()
    .domain([0, Math.max(...data.map(d => d[1]))])
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
    .attr("y", `${height - margin.top}`)
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
      .attr("cx", d => xScale(d[0]) )
      .attr("cy", d => yScale(d[1]) )
      .attr("r", 1.5)
      .style("fill", "#448878");

  return div.toReact();
};
