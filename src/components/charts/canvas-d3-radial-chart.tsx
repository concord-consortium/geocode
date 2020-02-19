import * as React from "react";
import * as d3 from "d3";
import { ChartType } from "../../stores/charts-store";

interface IProps {
  chart: ChartType;
  width: number;
}

export class CanvasD3RadialChart extends React.Component<IProps> {

  private canvasRef = React.createRef<HTMLCanvasElement>();
  private svgRef = React.createRef<SVGSVGElement>();

  public componentDidMount() {
    this.drawChart();
  }

  public componentDidUpdate() {
    if (this.canvasRef.current && this.svgRef.current) {
      // clear everything
      const ctx = this.canvasRef.current.getContext("2d")!;
      ctx.clearRect(0, 0, this.props.width, this.props.width);
      while (this.svgRef.current.lastChild) {
        this.svgRef.current.removeChild(this.svgRef.current.lastChild);
      }
    }
    this.drawChart();
  }

  public render() {
    const width = this.props.width;
    const relativeStyle: React.CSSProperties = {position: "relative", width, height: width};
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

    const { chart, width: totalWidth } = this.props;
    const data = chart.data;

    const margin = {top: 20, right: 20, bottom: 35, left: 20};
    const chartWidth = totalWidth - margin.left - margin.right;

    const svgAxes = d3.select(this.svgRef.current)
      .attr("width", totalWidth)
      .attr("height", totalWidth)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const maxMagnitude = d3.max(data, d => d[1]) || 1;
    const maxRadius = chartWidth / 2;
    const xScale = d3.scaleLinear()
      .domain([-maxMagnitude, maxMagnitude])
      .range([ 0, chartWidth]);
    const yScale = d3.scaleLinear()
      .domain([-maxMagnitude, maxMagnitude])
      .range([ chartWidth, 0]);
    const magScale = d3.scaleLinear()
        .domain([0, maxMagnitude])
        .range([ 0, maxRadius]);

    // add axes. Assume NESW for now, can add props to customize later if needed
    svgAxes.append("g")
      .call(d3.axisTop(xScale).tickValues([0]).tickFormat(() => "N"));
    svgAxes.append("g")
      .attr("transform", "translate(" + chartWidth + ", 0)")
      .call(d3.axisRight(yScale).tickValues([0]).tickFormat(() => "E"));
    svgAxes.append("g")
      .attr("transform", "translate(0," + chartWidth + ")")
      .call(d3.axisBottom(xScale).tickValues([0]).tickFormat(() => "S"));
    svgAxes.append("g")
      .call(d3.axisLeft(yScale).tickValues([0]).tickFormat(() => "W"));

    d3.select(this.canvasRef.current)
      .attr("width", chartWidth)
      .attr("height", chartWidth)
      .style("margin-left", margin.left + "px")
      .style("margin-top", margin.top + "px");

    const ctx = this.canvasRef.current.getContext("2d")!;

    const center = {x: chartWidth / 2, y: chartWidth / 2};

    // shrink path width from 0.5 to 0.1 between 1000 and 3000 data points
    const lineWidthShrink = Math.max(0, Math.min(1, (data.length - 1000) / 2000));
    ctx.lineWidth = 0.5 - (0.3 * lineWidthShrink);
    ctx.strokeStyle = "#3c7769";
    ctx.beginPath();
    data.forEach(point => {
      const px = center.x + Math.cos((90 - point[0]) * Math.PI / 180) * magScale(point[1]);
      const py = center.y - Math.sin((90 - point[0]) * Math.PI / 180) * magScale(point[1]);
      // const px = center.x + xScale(x);
      // const py = yScale(y);
      const headlen = 10; // length of head in pixels
      const dx = px - center.x;
      const dy = py - center.y;
      const rads = Math.atan2(dy, dx);
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(px, py);
      ctx.lineTo(
        px - headlen * Math.cos(rads - Math.PI / 6),
        py - headlen * Math.sin(rads - Math.PI / 6)
      );
      ctx.moveTo(px, py);
      ctx.lineTo(
        px - headlen * Math.cos(rads + Math.PI / 6),
        py - headlen * Math.sin(rads + Math.PI / 6)
      );
    });
    ctx.stroke();
  }

}
