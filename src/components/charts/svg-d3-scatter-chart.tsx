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

  if (fadeIn) {
    addFadeLegend(svg, data, chartWidth, margin);
  }

  return div.toReact();
};

type SVG = d3.Selection<SVGElement, unknown, null, undefined>;
interface Margin {left: number; top: number; right: number; bottom: number; }

// This is hard-coded to the Day legend right now, but would be simple to generalize
export function addFadeLegend(svg: SVG, data: any[], chartWidth: number, margin: Margin) {
  const legendSteps = 100;
  const legendWidth = 25;
  const legendHeight = 80;
  const legendRightPadding = 30;
  const legendColorLerp = (d3.scaleLinear().domain([0, legendSteps]) as any).range(["#448878", "white"]);
  const legend = svg.append("g")
    .attr("transform", "translate(" + (chartWidth - legendWidth - legendRightPadding) + "," + margin.top + ")");

  legend.append("text")
    .attr("x", legendWidth / 2)
    .attr("y", -5)
    .style("text-anchor", "middle")
    .style("font-size", "0.9em")
    .style("fill", "#555")
    .text("Day");

  legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("stroke", "black")
    .style("fill", "none");

  const bins = Array(legendSteps);
  legend.selectAll("bin")
    .data(bins)
    .enter()
    .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => (i / legendSteps) * legendHeight)
      .attr("width", legendWidth)
      .attr("height", (legendHeight / legendSteps))
      .style("stroke", "none")
      .style("fill", (d, i) => legendColorLerp(i));

  legend.append("text")
    .attr("x", legendWidth + 4)
    .attr("y", 5)
    .style("font-size", "0.6em")
    .style("fill", "#555")
    .text(data.length);
  legend.append("text")
    .attr("x", legendWidth + 4)
    .attr("y", (legendHeight / 2) + 3)
    .style("font-size", "0.6em")
    .style("fill", "#555")
    .text(Math.round(data.length / 2));
  legend.append("text")
    .attr("x", legendWidth + 4)
    .attr("y", legendHeight + 3)
    .style("font-size", "0.6em")
    .style("fill", "#555")
    .text("0");
}
