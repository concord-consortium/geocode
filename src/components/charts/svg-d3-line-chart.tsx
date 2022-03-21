import * as ReactFauxDOM from "react-faux-dom";
import * as d3 from "d3";
import { toJS } from "mobx";
import { IDeformationCases } from "../../stores/seismic-simulation-store";
import { NumberValue } from "d3";

interface LineChartProps { data: IDeformationCases; }

export const SvgD3LineChart = (props: LineChartProps) => {

  const data = toJS(props.data) as IDeformationCases;

  const div = new ReactFauxDOM.Element("div");

  // Calculate Margins and canvas dimensions
  const margin = {top: 40, right: 40, bottom: 40, left: 60};
  const width = 500 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  // Scales
  const x = d3.scaleLinear()
      .range([0, width]);

  const y = d3.scaleLinear()
      .range([height, 0]);

  // Line
  const line = d3.line<number[]>();

  // append the svg object to the body of the page
  const svg = d3.select(div)
    .append("svg")
      .style("background-color", "#fff")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Arguments for axes : Ranges for x, y
  x.domain(d3.extent(data, (d) => d.year) as NumberValue[]);
  y.domain(d3.extent(data, (d) => d.deformation) as NumberValue[]);

  // Axes
  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y));

   // Labels
  svg.append("text")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .attr("transform", "translate(" + (margin.left - 94 ) + "," + (height / 2) + ")rotate(-90)")
    .text("Deformation");

  svg.append("text")
    .style("font-size", "14px")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(" + (width / 2) + "," + (height - (margin.bottom - 74)) + ")")
    .text("Year");

  // Path
  svg.append("path")
    .attr("fill", "none")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 1)
    .attr("d", line(data.map( el => [x(el.year)!, y(el.deformation)!]))!);

  return div.toReact();
};
