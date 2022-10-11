import * as React from "react";
import * as d3 from "d3";
import { ChartType } from "../../stores/charts-store";
import { addFadeLegend, getFadeColor } from "./svg-d3-scatter-chart";

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
    console.log("CanvasD3ScatterChart is rendering");
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
    const { uniformXYScale } = chart;
    const xRange = Number(chart.extent(0)[1]) - Number(chart.extent(0)[0]);
    const yRange = Number(chart.extent(1)[1]) - Number(chart.extent(1)[0]);
    const chartWidth = width - margin.left - margin.right + (canvasPadding * 2);
    // adjust height if the x and y axes need to be scaled uniformly, base off of width
    const chartHeight = uniformXYScale
      ? yRange / xRange * chartWidth
      : height - margin.top - margin.bottom + (canvasPadding * 2);
    const usedHeight = uniformXYScale ? chartHeight + margin.top + margin.bottom + (canvasPadding * 2) : height;
    return { width, height: usedHeight, chartWidth, chartHeight};
  }

  private drawChart() {
    if (!this.canvasRef.current || !this.svgRef.current) return;

    const { chart } = this.props;
    const { data, xAxisLabel, yAxisLabel, fadeIn, gridlines, dataOffset, uniformXYScale } = chart;
    const chartDimensions = this.calculateChartDimensions();
    const { width, height, chartWidth, chartHeight } = chartDimensions;

    const xRange = Number(chart.extent(0)[1]) - Number(chart.extent(0)[0]);
    const yRange = Number(chart.extent(1)[1]) - Number(chart.extent(1)[0]);
    const xUniformTicks = Math.floor(xRange / 100);
    const yUniformTicks = Math.floor(yRange / 100);

    const svgAxes = d3.select(this.svgRef.current)
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
      svgAxes.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + chartHeight + ")")
        .style("stroke", "#C0C0C0")
        .style("stroke-opacity", ".5")
        .call(make_x_gridlines()
            .tickSize(-chartHeight)
            .tickFormat((d) => "")
        );

      // add the Y gridlines
      svgAxes.append("g")
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
        d3.axisBottom(xScale).tickFormat((date: Date) => {
          // remove last "Jan" from Time of Year chart
          if (chart.dateLabelFormat === "%b" && date.getFullYear() === 1901) return "";
          return chart.toDateString()(date);
        }) :
        uniformXYScale ? d3.axisBottom(xScale).ticks(xUniformTicks) : d3.axisBottom(xScale).ticks;
    svgAxes.append("g")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(axisBottom);

    const axisLeft = chart.isDate(1) ?
      d3.axisLeft(yScale).tickFormat(chart.toDateString()) :
      uniformXYScale ? d3.axisLeft(yScale).ticks(yUniformTicks) : d3.axisLeft(yScale);
    svgAxes.append("g")
      .call(axisLeft);

    // Add labels
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

    d3.select(this.canvasRef.current)
      .attr("width", width + (canvasPadding * 2))
      .attr("height", height + (canvasPadding * 2))
      .style("margin-left", margin.left - canvasPadding + "px")
      .style("margin-top", margin.top - canvasPadding + "px");

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
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      addFadeLegend(svg, data, chartWidth, margin);
    }
  }

}
