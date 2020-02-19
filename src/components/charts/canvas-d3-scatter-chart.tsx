import * as React from "react";
import * as d3 from "d3";
import { ChartType } from "../../stores/charts-store";

interface IProps {
  chart: ChartType;
  width: number;
  height: number;
}

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
        <canvas ref={this.canvasRef} style={absoluteStyle} />
        <svg ref={this.svgRef} style={absoluteStyle} />
      </div>
    );
  }

  private drawChart() {
    if (!this.canvasRef.current || !this.svgRef.current) return;

    const { width, height, chart } = this.props;
    const { data, xAxisLabel, yAxisLabel } = chart;

    const margin = {top: 15, right: 20, bottom: 35, left: 50};
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svgAxes = d3.select(this.svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xScale = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d[0]))])
      .range([ 0, chartWidth ]);
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d[1]))])
      .range([ chartHeight, 0]);

    // add axes
    svgAxes.append("g")
      .attr("transform", "translate(0," + chartHeight + ")")
      .call(d3.axisBottom(xScale));

    svgAxes.append("g")
      .call(d3.axisLeft(yScale));

    // Add labels
    if (xAxisLabel) {
      svgAxes.append("text")
        .attr("x", `${width / 3}`)
        .attr("y", `${height - margin.top}`)
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
      .attr("width", width)
      .attr("height", height)
      .style("margin-left", margin.left + "px")
      .style("margin-top", margin.top + "px");

    const ctx = this.canvasRef.current.getContext("2d")!;

    data.forEach(point => {
      ctx.beginPath();
      ctx.fillStyle = "#448878";
      const px = xScale(point[0]);
      const py = yScale(point[1]);

      ctx.arc(px, py, 1.2, 0, 2 * Math.PI, true);
      ctx.fill();
    });
  }

}
