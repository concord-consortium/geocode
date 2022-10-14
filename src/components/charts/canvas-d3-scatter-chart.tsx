import * as React from "react";
import * as d3 from "d3";
import { ChartType } from "../../stores/charts-store";
import { addFadeLegend, getFadeColor } from "./svg-d3-scatter-chart";
import { format } from "mathjs";

type Scale = d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;

interface IProps {
  chart: ChartType;
  width: number;
  height: number;
}

const margin = {top: 15, right: 20, bottom: 43, left: 50};
const canvasPadding = 3;      // extend canvas slightly beyond axes

/**
 * A D3-based canvas scatter chart, made for render large amounts of data quickly.
 *
 * Chart data may be numeric or Date on either axis (when needed we could support strings as well)
 */
export class CanvasD3ScatterChart extends React.Component<IProps> {
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private svgRef = React.createRef<SVGSVGElement>();

  public componentDidMount() {
    this.drawChart();
  }

  public componentDidUpdate() {
    if (this.canvasRef.current && this.svgRef.current) {
      // clear everything
      const ctx = this.canvasRef.current.getContext("2d")!;
      ctx.clearRect(0, 0, this.props.width, this.props.height);
      while (this.svgRef.current.lastChild) {
        this.svgRef.current.removeChild(this.svgRef.current.lastChild);
      }
    }
    this.drawChart();
  }

  public render() {
    const chartDimensions = this.calculateChartDimensions();
    const { width, height } = chartDimensions;
    const relativeStyle: React.CSSProperties = {position: "relative", width, height};
    const absoluteStyle: React.CSSProperties = {position: "absolute", top: 0, left: 0};
    return (
      <div style={relativeStyle}>
        <svg ref={this.svgRef} style={absoluteStyle} />
        <canvas ref={this.canvasRef} style={absoluteStyle} />
      </div>
    );
  }

  private calculateChartDimensions() {
    const { width, height, chart } = this.props;
    const { uniformXYScale, xAxisLabel2, yAxisLabel2 } = chart;
    const xRange = Number(chart.extent(0)[1]) - Number(chart.extent(0)[0]);
    const yRange = Number(chart.extent(1)[1]) - Number(chart.extent(1)[0]);

    let chartWidth = width - margin.left - margin.right + (canvasPadding * 2);
    // accommodate extra space for labels on left and right sides
    if (xAxisLabel2) chartWidth -= 200;

    // adjust height if the x and y axes need to be scaled uniformly, base off of width
    const chartHeight = uniformXYScale
      ? yRange / xRange * chartWidth
      : height - margin.top - margin.bottom + (canvasPadding * 2);

    let usedHeight = height;
    if (uniformXYScale) {
      usedHeight = chartHeight + margin.top + margin.bottom + (canvasPadding * 2);
      // accommodate extra space for labels on top and bottom
      if (yAxisLabel2) usedHeight += 50;
    }
    return { width, height: usedHeight, chartWidth, chartHeight};
  }

  private drawChart() {
    if (!this.canvasRef.current || !this.svgRef.current) return;

    const { chart } = this.props;
    const { data, xAxisLabel, yAxisLabel, fadeIn, gridlines, dataOffset, uniformXYScale,
      xAxisLabel2, yAxisLabel2 } = chart;
    const hasFourAxisLabels = !!xAxisLabel && !!yAxisLabel && !!xAxisLabel2 && !!yAxisLabel2;
    const chartDimensions = this.calculateChartDimensions();
    const { width, height, chartWidth, chartHeight } = chartDimensions;

    const xRange = Number(chart.extent(0)[1]) - Number(chart.extent(0)[0]);
    const yRange = Number(chart.extent(1)[1]) - Number(chart.extent(1)[0]);
    const xUniformTicks = Math.floor(xRange / 100);
    const yUniformTicks = Math.floor(yRange / 100);

    const marginLeft = hasFourAxisLabels ? (margin.left + 75) : margin.left;
    const marginTop = hasFourAxisLabels ? (margin.top + 50) : margin.top;

    const svgAxes = d3.select(this.svgRef.current)
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
      svgAxes.append("g")
        .attr("class", "grid x")
        .attr("transform", "translate(0," + chartHeight + ")")
        .style("stroke", "#C0C0C0")
        .style("stroke-opacity", ".5")
        .call(make_x_gridlines()
            .tickSize(-chartHeight)
            .tickFormat((d) => "")
        );

      // add the Y gridlines
      svgAxes.append("g")
        .attr("class", "grid y")
        .style("stroke", "#C0C0C0")
        .style("stroke-opacity", ".5")
        .call(make_y_gridlines()
            .tickSize(-chartWidth)
            .tickFormat((d) => "")
        );

      if (hasFourAxisLabels) {
        d3.selectAll(".grid").selectAll(".domain").style("opacity", "0");

        const ticks = d3.selectAll(".grid").selectAll(".tick");
        ticks.style("stroke-opacity", (d) => d === 0 ? "1" : ".5");

        const getStrokeWidth = (d: unknown, idx: number, numTicks: number) => {
          return d === 0 ? "5px" : idx === 0 || idx === numTicks ? "0px" : "1px";
        };

        d3.selectAll(".grid.x").selectAll(".tick")
          .style("stroke-width", (d, idx) => getStrokeWidth(d, idx, xUniformTicks));
        d3.selectAll(".grid.y").selectAll(".tick")
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
          }) :
          uniformXYScale ? d3.axisBottom(xScale).ticks(xUniformTicks) : d3.axisBottom(xScale).ticks;
      xAxisTranslation = `(0, ${chartHeight})`;

      axisLeft = chart.isDate(1) ?
        d3.axisLeft(yScale).tickFormat(chart.toDateString()) :
        uniformXYScale ? d3.axisLeft(yScale).ticks(yUniformTicks): d3.axisLeft(yScale);
      yAxisTranslation = "none";
    }
    svgAxes.append("g")
      .attr("transform", `translate${xAxisTranslation}`)
      .attr("class", "bottom axis")
      .call(axisBottom);

    svgAxes.append("g")
      .attr("transform", yAxisTranslation)
      .attr("class", "left axis")
      .call(axisLeft)

    console.log(`d3.selectAll(".bottom.axis").selectAll("path")`, d3.selectAll(".bottom.axis").selectAll("path"));

    if (hasFourAxisLabels) {
      d3.selectAll(".axis").selectAll("path").style("stroke-width", "25px").style("stroke", "#fff");
      d3.selectAll(".bottom.axis").selectAll("path").attr("transform", "translate(0, 5)");
      d3.selectAll(".left.axis").selectAll("path").attr("transform", "translate(-12, 0)");
    }

    // Add labels
    if (!hasFourAxisLabels) {
      if (xAxisLabel) {
        svgAxes.append("text")
          .attr("x", `${chartWidth / 2}`)
          .attr("y", `${height - 20}`)
          .style("text-anchor", "middle")
          .style("font-size", "0.9em")
          .style("fill", "#555")
          .text(xAxisLabel);
      }
      if (yAxisLabel) {
        svgAxes.append("text")
          .attr("x", `-${(height / 2) - 20}`)
          .attr("dy", "-30px")
          .style("text-anchor", "middle")
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
      svgAxes.append("g")
        .attr("class", "axes-labels")
        .attr("transform", `translate${labelTranslations[i]}`)
        .call(label)
    }

    const axesLabels = d3.selectAll("g.axes-labels");
    axesLabels.selectAll("path").style("opacity", "0");
    axesLabels.style("font-size", "0.9em").style("font-weight", "bold");

    axesLabels.selectAll("g.tick").filter((d) => d === 0).append("g")
        .attr("class", "mm-label")
        .append("text")
          .style("fill", "#555")
          .text("(mm)")

    const mmTranslations = ["10px, 10px", "0px, 30px", "-35px, 20px", "40px, 20px"]
    const getMMTranslationValue = (idx: number) => `translate(${mmTranslations[idx]})`;
    d3.selectAll(".mm-label").style("transform", (d, idx) => getMMTranslationValue(idx))
  }

    d3.select(this.canvasRef.current)
      .attr("width", chartWidth + (canvasPadding * 2))
      .attr("height", chartHeight + (canvasPadding * 2))
      .style("margin-left", marginLeft - canvasPadding + "px")
      .style("margin-top", marginTop - canvasPadding + "px");

    const ctx = this.canvasRef.current.getContext("2d")!;

    const color = (i: number) => getFadeColor(i);

    data.forEach((d: number[] | Date[], i) => {
      ctx.beginPath();
      if (!fadeIn) {
        ctx.fillStyle = "#448878";
      } else {
        ctx.fillStyle = color(dataOffset + i);
      }

      const px = xScale(d[0])! + canvasPadding;
      const py = yScale(d[1])! + canvasPadding;

      ctx.arc(px, py, fadeIn ? 2 : 1.5, 0, 2 * Math.PI, true);
      ctx.fill();
    });

    if (fadeIn) {
      const svg = d3.select(this.svgRef.current).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + marginLeft + "," + marginTop + ")");

      addFadeLegend(svg, data, chartWidth + 80, margin);
    }
  }

}
