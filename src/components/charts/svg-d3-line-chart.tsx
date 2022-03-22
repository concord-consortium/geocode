import * as ReactFauxDOM from "react-faux-dom";
import * as d3 from "d3";
import { IDeformationRuns } from "../../stores/seismic-simulation-store";
import { NumberValue } from "d3";

interface LineChartProps { data: IDeformationRuns; }

export const SvgD3LineChart = (props: LineChartProps) => {

  const div = new ReactFauxDOM.Element("div");
  const data = props.data as IDeformationRuns;
  
  // Calculate Margins and canvas dimensions
  const margin = {top: 40, right: 40, bottom: 40, left: 60};
  const width = 500 - margin.left - margin.right;
  const height = 200 - margin.top - margin.bottom;

  // Getting all X and Y values, to be used in scales
  const xVals: NumberValue[] = [];
  const yVals: NumberValue[] = [];

  for (const run of data){
    const values = run.values;
    values.forEach(value => {
      xVals.push(value.year);
      yVals.push(value.deformation);
    });
  }

  // Setting up color scheme
  const allGroup = ["run1", "run2", "run3"];
  const myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(d3.schemeSet2);

  // Scales
  const x = d3.scaleLinear()
      .range([0, width]);

  const y = d3.scaleLinear()
      .range([height, 0]);

  // Domains
  x.domain(d3.extent(xVals) as NumberValue[]);
  y.domain(d3.extent(yVals) as NumberValue[]);

  // append the svg object to the body of the page
  const svg = d3.select(div)
    .append("svg")
      .style("background-color", "#fff")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Axes
  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y));

   // X and Y axes labels
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

  // Line
  const line = d3.line();

  // Path
  svg.selectAll("myLines")
    .data(data)
    .enter()
      .append("path")
      .attr("class", (d) => "run" + d.group)
      .attr("fill", "none")
      .attr("stroke", (d) => myColor("run" + d.group) as string)
      .attr("stroke-width", 4)
      .attr("d", (d) => line(d.values!.map(value => [x(value.year)!, y(value.deformation)!])));

  // Legend
  svg.selectAll("myLegend")
    .data(data)
    .enter()
      .append("g")
      .append("text")
        .attr("x", (d, i) => 30 + (i * 60))
        .attr("y", 0)
        .text((d) => "Run" + d.group)
        .style("fill", (d) => myColor("run" + d.group) as string)
        .style("font-size", 15)
      .on("click", (d) => {
        const currentOpacity = d3.selectAll(".run" + d.group).style("opacity");
        d3.selectAll(".run" + d.group).transition().style("opacity", currentOpacity === "1" ? "0" : "1");
      });

  return div.toReact();
};
