import * as ReactFauxDOM from "react-faux-dom";
import * as d3 from "d3";
import { ChartType } from "../../stores/charts-store";

type Scale = d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;

interface FadeColor {
  color: string;
  max: number;
}

const kLegendMiddleValue = "3,500";
const kLegendMaxValue = "7,179";

const fadeColors: FadeColor[] = [
  { color: "#00248f", max: 1001 },
  { color: "#6e08b7", max: 2000 },
  { color: "#ac19ab", max: 3000 },
  { color: "#dc3d8c", max: 4000 },
  { color: "#ff6900", max: 5000 },
  { color: "#ff9d0b", max: 6000 },
  { color: "#ffc92c", max: 7000 },
  { color: "#f2f659", max: 7179 }
];

interface IProps {
  chart: ChartType;
  width: number;
  height: number;
}

export const SvgD3ScatterChart = (props: IProps) => {
  const calculateChartDimensions = (_xRange: number, _yRange: number) => {
    const _chart = props.chart;
    const _width = props.width;
    const _height = props.height;
    const _uniformXYScale = _chart.uniformXYScale;
    const chartUsedWidth = _width - margin.left - margin.right;
    // adjust height if the x and y axes need to be scaled uniformly, base off of width
    const chartUsedHeight = _uniformXYScale
      ? _yRange / _xRange * chartUsedWidth
      : _height - margin.top - margin.bottom;
    const usedHeight = _uniformXYScale ? chartUsedHeight + margin.top + margin.bottom : _height;
    return { width: _width, height: usedHeight, chartWidth: chartUsedWidth, chartHeight: chartUsedHeight};
  };

  const { chart } = props;
  const { data, xAxisLabel, yAxisLabel, fadeIn, gridlines, dataOffset, uniformXYScale } = chart;
  const xRange = Number(chart.extent(0)[1]) - Number(chart.extent(0)[0]);
  const yRange = Number(chart.extent(1)[1]) - Number(chart.extent(1)[0]);
  const xUniformTicks = Math.floor(xRange / 100);
  const yUniformTicks = Math.floor(yRange / 100);
  const margin = {top: 15, right: 20, bottom: 43, left: 50};
  const chartDimensions = calculateChartDimensions(xRange, yRange);
  const { width, height, chartWidth, chartHeight } = chartDimensions;

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

  function make_x_gridlines() {
    return d3.axisBottom(xScale)
        .ticks(xUniformTicks);
  }

  function make_y_gridlines() {
    return d3.axisLeft(yScale)
        .ticks(yUniformTicks);
  }

  if (gridlines) {
    // add the X gridlines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(0," + chartHeight + ")")
      .style("stroke", "#C0C0C0")
      .style("stroke-opacity", ".5")
      .call(make_x_gridlines()
          .tickSize(-chartHeight)
          .tickFormat((d) => "")
      );

    // add the Y gridlines
    svg.append("g")
      .attr("class", "grid")
      .style("stroke", "#C0C0C0")
      .style("stroke-opacity", ".5")
      .call(make_y_gridlines()
          .tickSize(-chartWidth)
          .tickFormat((d) => "")
      );
  }

  // add axes
  const axisBottom = chart.isDate(0) ?
      d3.axisBottom(xScale).tickFormat(chart.toDateString()) :
      uniformXYScale ? d3.axisBottom(xScale).ticks(xUniformTicks) : d3.axisBottom(xScale).ticks;
  svg.append("g")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(axisBottom);

  const axisLeft = chart.isDate(1) ?
    d3.axisLeft(yScale).tickFormat(chart.toDateString()) :
    uniformXYScale ? d3.axisLeft(yScale).ticks(yUniformTicks) : d3.axisLeft(yScale).ticks;
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

  const color = fadeIn
    ? (d: number, i: number) => getFadeColor(dataOffset + i)
    : "#448878";

  svg.append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", d => xScale((d as number[] | Date[])[0]) )
      .attr("cy", d => yScale((d as number[] | Date[])[1]) )
      .attr("r", fadeIn ? 2 : 1.5)
      .style("fill", (color as any));

  if (fadeIn) {
    addFadeLegend(svg, data, chartWidth, margin);
  }

  return div.toReact();
};

type SVG = d3.Selection<SVGElement, unknown, null, undefined>;
interface Margin {left: number; top: number; right: number; bottom: number; }

export const getFadeColor = (index: number) => {
  const fadeColor = fadeColors.find((item) => index <= item.max);
  return fadeColor
    ? fadeColor.color
    : index < 0 ? fadeColors[0].color : fadeColors[fadeColors.length - 1].color;
};

// This is hard-coded to the Day legend right now, but would be simple to generalize
export function addFadeLegend(svg: SVG, data: any[], chartWidth: number, margin: Margin) {
  const legendSteps = fadeColors.length;
  const legendWidth = 25;
  const legendHeight = 80;
  const legendRightPadding = 35;
  const legendFadeColors = fadeColors.map((item) => item.color).reverse();

  const legend = svg.append("g")
    .attr("transform", "translate(" + (chartWidth - legendWidth - legendRightPadding) + "," + margin.top + ")");

  legend.append("text")
    .attr("x", legendWidth / 2)
    .attr("y", 0)
    .style("text-anchor", "middle")
    .style("font-size", "0.9em")
    .style("fill", "#555")
    .text("Day");

  legend.append("rect")
    .attr("x", 0)
    .attr("y", 5)
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
      .attr("y", (d, i) => 5 + (i / legendSteps) * legendHeight)
      .attr("width", legendWidth)
      .attr("height", (legendHeight / legendSteps))
      .style("stroke", "none")
      .style("fill", (d, i) => legendFadeColors[i]);

  legend.append("text")
    .attr("x", legendWidth + 4)
    .attr("y", 10)
    .style("font-size", "0.6em")
    .style("fill", "#555")
    .text(kLegendMaxValue);
  legend.append("text")
    .attr("x", legendWidth + 4)
    .attr("y", (legendHeight / 2) + 8)
    .style("font-size", "0.6em")
    .style("fill", "#555")
    .text(kLegendMiddleValue);
  legend.append("text")
    .attr("x", legendWidth + 4)
    .attr("y", legendHeight + 8)
    .style("font-size", "0.6em")
    .style("fill", "#555")
    .text("0");
}
