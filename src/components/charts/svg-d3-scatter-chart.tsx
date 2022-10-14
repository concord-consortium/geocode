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
    const xAxisLabel2 = _chart.xAxisLabel2;
    const yAxisLabel2 = _chart.yAxisLabel2;
    let chartUsedWidth = _width - margin.left - margin.right;
    if (xAxisLabel2) chartUsedWidth -= 200;
    // adjust height if the x and y axes need to be scaled uniformly, base off of width
    const chartUsedHeight = _uniformXYScale
      ? _yRange / _xRange * chartUsedWidth
      : _height - margin.top - margin.bottom;
    let usedHeight = _uniformXYScale ? chartUsedHeight + margin.top + margin.bottom : _height;
    if (yAxisLabel2) usedHeight += 50;
    return { width: _width, height: usedHeight, chartWidth: chartUsedWidth, chartHeight: chartUsedHeight};
  };

  const { chart } = props;
  const { data, xAxisLabel, yAxisLabel, fadeIn, gridlines, dataOffset,
          uniformXYScale, xAxisLabel2, yAxisLabel2 } = chart;
  const hasFourAxisLabels = !!xAxisLabel && !!yAxisLabel && !!xAxisLabel2 && !!yAxisLabel2;
  const xRange = Number(chart.extent(0)[1]) - Number(chart.extent(0)[0]);
  const yRange = Number(chart.extent(1)[1]) - Number(chart.extent(1)[0]);
  const xUniformTicks = Math.floor(xRange / 100);
  const yUniformTicks = Math.floor(yRange / 100);

  console.log("xRange", xRange, "yRange", yRange, uniformXYScale);

  const margin = {top: 15, right: 20, bottom: 43, left: 50};
  const marginLeft = hasFourAxisLabels ? (margin.left + 75) : margin.left;
  const marginTop = hasFourAxisLabels ? (margin.top + 50) : margin.top;

  const chartDimensions = calculateChartDimensions(xRange, yRange);
  const { width, height, chartWidth, chartHeight } = chartDimensions;

  const div = new ReactFauxDOM.Element("div");

  const svg = d3.select(div).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + marginLeft + "," + marginTop + ")");

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
      .attr("class", "grid x")
      .attr("transform", "translate(0," + chartHeight + ")")
      .style("stroke", "#C0C0C0")
      .style("stroke-opacity", ".5")
      .call(make_x_gridlines()
          .tickSize(-chartHeight)
          .tickFormat((d) => "")
      );

    // add the Y gridlines
    svg.append("g")
      .attr("class", "grid y")
      .style("stroke", "#C0C0C0")
      .style("stroke-opacity", ".5")
      .call(make_y_gridlines()
          .tickSize(-chartWidth)
          .tickFormat((d) => "")
      );

    if (hasFourAxisLabels) {
      svg.selectAll(".grid").selectAll(".domain").style("opacity", "0");
      const ticks = svg.selectAll(".tick");
      ticks.style("stroke-opacity", (d) => d === 0 ? "1" : ".5");

      const getStrokeWidth = (d: unknown, idx: number, numTicks: number) => {
        return d === 0 ? "5px" : idx === 0 || idx === numTicks ? "0px" : "1px";
      };

      svg.selectAll(".grid.x").selectAll(".tick")
        .style("stroke-width", (d, idx) => getStrokeWidth(d, idx, xUniformTicks));
      svg.selectAll(".grid.y").selectAll(".tick")
        .style("stroke-width", (d, idx) =>  getStrokeWidth(d, idx, yUniformTicks));
    }
  }

  // add axes
  let axisBottom;
  let xAxisTranslation;
  let axisLeft;
  let yAxisTranslation;

  if (hasFourAxisLabels) {
    const formatTick = (d: unknown) => Number(d) < 0 ? `${(Number(d) * (-1))}` : `${d}`;

    axisBottom = d3.axisBottom(xScale).ticks(xUniformTicks).tickSize(0).tickFormat((d) => formatTick(d))
    xAxisTranslation = `(0, ${(yScale(0)! + 10)})`;

    axisLeft = d3.axisLeft(yScale).ticks(yUniformTicks).tickSize(0).tickFormat((d) => formatTick(d));
    yAxisTranslation = `translate(${xScale(0)! - 10}, 0)`
  } else {
    axisBottom = chart.isDate(0) ?
        d3.axisBottom(xScale).tickFormat((date: Date) => {
          // remove last "Jan" from Time of Year chart
          if (chart.dateLabelFormat === "%b" && date.getFullYear() === 1901) return "";
          return chart.toDateString()(date);
        }) : uniformXYScale ? d3.axisBottom(xScale).ticks(xUniformTicks) : d3.axisBottom(xScale);
    xAxisTranslation = `(0, ${chartHeight})`;

    axisLeft = chart.isDate(1) ?
      d3.axisLeft(yScale).tickFormat(chart.toDateString()) : uniformXYScale ? d3.axisLeft(yScale).ticks(yUniformTicks): d3.axisLeft(yScale);
      yAxisTranslation = `translate(0, 0)`;
    }

    svg.append("g")
      .attr("transform", `translate${xAxisTranslation}`)
      .attr("class", "bottom axis")
      .call(axisBottom);

    svg.append("g")
      .attr("transform", yAxisTranslation)
      .attr("class", "left axis")
      .call(axisLeft)

    if (hasFourAxisLabels) {
      svg.selectAll(".axis").selectAll("path").style("stroke-width", "25px").style("stroke", "#fff");
      svg.selectAll(".bottom.axis").selectAll("path").attr("transform", "translate(0, 5)");
      svg.selectAll(".left.axis").selectAll("path").attr("transform", "translate(-12, 0)");
  }

  // Add labels
  if (!hasFourAxisLabels) {
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
  } else {
    const axesForLabels = [d3.axisTop, d3.axisBottom, d3.axisLeft, d3.axisRight];
    const scales = [xScale, xScale, yScale, yScale];
    const ticks = [xUniformTicks, xUniformTicks, yUniformTicks, yUniformTicks];
    const labelText = [yAxisLabel, yAxisLabel2, xAxisLabel2, xAxisLabel];
    const labelTranslations = [`(0, -20)`, `(0, ${(chartHeight + 10)})`, `(0, 0)`, `(${chartWidth}, 0)`];

    for (let i = 0; i < axesForLabels.length; i ++) {
      const label = axesForLabels[i](scales[i]).ticks(ticks[i]).tickSize(0).tickFormat((d) => d === 0 ? labelText[i] : "");
      svg.append("g")
        .attr("class", "axes-labels")
        .attr("transform", `translate${labelTranslations[i]}`)
        .call(label)
    }

    const axesLabels = svg.selectAll("g.axes-labels");
    axesLabels.selectAll("path").style("opacity", "0");
    axesLabels.style("font-size", "0.9em").style("font-weight", "bold");

    axesLabels.selectAll("g.tick").filter((d) => d === 0).append("g")
        .attr("class", "mm-label")
        .append("text")
          .style("fill", "#555")
          .text("(mm)")

    const mmTranslations = ["10px, 10px", "0px, 30px", "-35px, 20px", "40px, 20px"]
    const getMMTranslationValue = (idx: number) => `translate(${mmTranslations[idx]})`;
    svg.selectAll(".mm-label").style("transform", (d, idx) => getMMTranslationValue(idx))
  }

  const color = fadeIn
    ? (d: number, i: number) => getFadeColor(dataOffset + i)
    : "#448878";

  svg.append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", d => xScale((d as number[] | Date[])[0])! )
      .attr("cy", d => yScale((d as number[] | Date[])[1])! )
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
  const legendFadeColors = fadeColors.map((item) => item.color).reverse();

  const legend = svg.append("g")
    .attr("transform", "translate(" + (chartWidth + 20) + "," + margin.top + ")");

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
