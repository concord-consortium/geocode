import * as ReactFauxDOM from "react-faux-dom";
import * as d3 from "d3";

const data = [
  {x: 5, y: 10},
  {x: 10, y: 15},
  {x: 20, y: 25}
]

export const SvgD3LineChart = () => {

  const div = new ReactFauxDOM.Element("div");

  // append the svg object to the body of the page
  const svg = d3.select(div)
    .append("svg")
      .attr("viewBox", "0 0 100 100")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d, i) {
          return d.x;
        })
    .attr("cy", function (d, i) {
      return d.y;
    })
    .attr("r", 4)


  return div.toReact();
}