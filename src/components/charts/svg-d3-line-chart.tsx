import * as ReactFauxDOM from "react-faux-dom";
import * as d3 from "d3";
import { IDeformationRuns, IDeformationGroup } from "../../stores/seismic-simulation-store";
import { NumberValue } from "d3";

interface LineChartProps {
  data: IDeformationRuns;
  width: number;
  height: number;
}

export const SvgD3LineChart = (props: LineChartProps) => {

  const div = new ReactFauxDOM.Element("div");
  const data = props.data as IDeformationRuns;
  const { width, height } = props;

  // Calculate Margins and canvas dimensions
  const margin = {top: 40, right: 40, bottom: 40, left: 40};

  // Setting up color scheme
  const allGroup = ["run1", "run2", "run3"];
  const myColor = d3.scaleOrdinal()
      .domain(allGroup)
      .range(d3.schemeSet2);

  // Scales
  const x = d3.scaleLinear()
      .range([20, width - 60]);

  const y = d3.scaleLinear()
      .range([height, 0]);

  // Domains
  x.domain([0, 500]);
  y.domain([0, 20]);

  // append the svg object to the body of the page
  const svg = d3.select(div)
    .append("svg")
      .style("background-color", "#fff")
      .attr("width", width)
      .attr("height", height + margin.top + margin.bottom - 5)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Axes
  svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(20, 0)")
    .call(d3.axisLeft(y)
            .tickValues([0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20])
            .tickFormat((d) => {
              if (d === 5){
                return "Low";
              } else if (d === 10){
                return "Medium";
              } else if (d === 20){
                return "High";
              } else {
                return "";
              }
            }));

   // X and Y axes labels
  svg.append("text")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .attr("transform", "translate(" + (margin.left - 65) + "," + (height / 2) + ")rotate(-90)")
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
      .attr("d", (d: IDeformationGroup) => line(d.values.map(value => [x(value.year)!, y(value.deformation)!])));

  // Legend
  svg.selectAll("myLegend")
    .data(data)
    .enter()
      .append("g")
      .append("text")
        .attr("x", (d, i) => 30 + (i * 60))
        .attr("y", -15)
        .text((d) => "Run" + d.group)
        .style("fill", (d) => myColor("run" + d.group) as string)
        .style("text-decoration", "underline")
        .style("font-size", 15)
      .on("click", (d) => {
        const currentOpacity = d3.selectAll(".run" + d.group).style("opacity");
        d3.selectAll(".run" + d.group).transition().style("opacity", currentOpacity === "1" ? "0" : "1");
      });

  return div.toReact();
};
