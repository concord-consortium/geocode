import * as React from "react";
import * as d3 from "d3";
import { ChartType } from "../../stores/charts-store";

type Scale = d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;

interface IProps {
  chart: ChartType;
  width: number;
  height: number;
}

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
    const { width, height } = this.props;
    const relativeStyle: React.CSSProperties = {position: "relative", width, height};
    const absoluteStyle: React.CSSProperties = {position: "absolute", top: 0, left: 0};
    return (
      <div style={relativeStyle}>
        <svg ref={this.svgRef} style={absoluteStyle} />
        <canvas ref={this.canvasRef} style={absoluteStyle} />
      </div>
    );
  }

  private drawChart() {
    if (!this.canvasRef.current || !this.svgRef.current) return;

    const { width, height, chart } = this.props;
    const { data, xAxisLabel, yAxisLabel } = chart;

    const margin = {top: 15, right: 20, bottom: 43, left: 50};
    const canvasPadding = 3;      // extend canvas slightly beyond axes
    const chartWidth = width - margin.left - margin.right + (canvasPadding * 2);
    const chartHeight = height - margin.top - margin.bottom + (canvasPadding * 2);

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

    // add axes
    const axisBottom = chart.isDate(0) ?
        d3.axisBottom(xScale).tickFormat(chart.toDateString()) :
        d3.axisBottom(xScale);
    svgAxes.append("g")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(axisBottom);

    const axisLeft = chart.isDate(1) ?
      d3.axisLeft(yScale).tickFormat(chart.toDateString()) :
      d3.axisLeft(yScale);
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
        .attr("x", `-${height / 2}`)
        .attr("dy", "-30px")
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

    data.forEach(d => {
      ctx.beginPath();
      ctx.fillStyle = "#448878";
      const px = xScale(d[0]) + canvasPadding;
      const py = yScale(d[1]) + canvasPadding;

      ctx.arc(px, py, 1.5, 0, 2 * Math.PI, true);
      ctx.fill();
    });
  }

}
