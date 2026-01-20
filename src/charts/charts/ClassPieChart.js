/**
 * @fileoverview Defines a PieChart component that visualizes the distribution of classes within a dataset.
 * Utilizes D3.js for rendering and interactive visualization.
 * 
 * @requires d3 - D3.js library for manipulating documents based on data.
 */

// ClassPieChart.js
import * as d3 from "d3";
import { DataStore } from "../DataStore.js";

export default class ClassPieChart {
  /**
   * Creates a PieChart inside the given container element.
   * @param {HTMLElement} element - The container for the chart
   * @param {DataStore} dataStore - Object holding all neccessary data
   */

  constructor(element, dataStore, size = 500, isZoomable = true) {
    this.element = element;
    this.dataStore = dataStore;

    // dimensions
    this.width = size;
    this.height = size;
    this.margin = 10;
    this.legendLeftMargin = 40;             // left margin dividing piechart and legend
    this.legendMargin = 25;                 // height of row in the legend including top margin
    this.dotSize = (this.legendMargin) / 2; // size of dots in legend
    this.legendTextLeftMargin = 5           // left maergin dividing dots and text in legend


    this.radius = Math.min(this.width, this.height) / 2 - this.margin;

    const rect = this.element.getBoundingClientRect();
    const clientWidth = rect.width;

    // calculate SVG width and height
    const classDistribution = this.dataStore.getClassDistributionInPercentage();
    const keys = classDistribution.map(d => d.label);

    let legendHeight = keys.length * this.legendMargin;
    let svgHeight = Math.max(legendHeight, this.height);

    let legendMaxKeyWidth = this.getLegendMaxWidth(classDistribution);
    let svgWidth = Math.max(clientWidth, ((this.radius * 2) + (this.margin * 2) + this.legendLeftMargin + legendMaxKeyWidth))


    // container
    this.element.innerHTML = `
  <svg width="${svgWidth}" height="${svgHeight}"></svg>
`;

    // SVG
    this.svg = d3.select(this.element).select("svg");

    // root group controlled by zoom
    this.rootGroup = this.svg.append("g");

    // chart group (pie + legend)
    this.chartGroup = this.rootGroup.append("g");

    this.chartGroup = this.svg.append("g")
      .attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);

    // pie generator
    this.pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    // arc generator
    this.arc = d3.arc()
      .innerRadius(0)
      .outerRadius(this.radius);

    // zoom behavior
    if (isZoomable) {
      this.zoom = d3.zoom()
        .scaleExtent([0.5, 1.5])
        .on("zoom", (event) => {
          this.chartGroup.attr("transform", event.transform);
        });

      this.svg.call(this.zoom);

      this.svg.call(
        this.zoom.transform,
        d3.zoomIdentity.translate(this.width / 2, this.height / 2)
      );
    }

    this.draw();
  }


  // draw
  draw() {
    const classDistribution = this.dataStore.getClassDistributionInPercentage();
    const keys = classDistribution.map(d => d.label);

    let legendX = this.arc.outerRadius()() + this.legendLeftMargin;
    let legendYStart = - this.arc.outerRadius()();
    let legendSize = keys.length * this.legendMargin;
    let pieSize = (this.arc.outerRadius()() * 2);

    // align legend to center
    if (legendSize >= pieSize) {
      let diff = (legendSize - pieSize) / 2;
      legendYStart -= diff;
    } else {
      let diff = (pieSize - legendSize) / 2;
      legendYStart += diff;
    }

    // rainbow colors
    this.color = d3.scaleOrdinal()
      .domain(keys)
      .range(keys.map((d, i) => d3.interpolateRainbow(i / keys.length)));

    // pie chart
    const arcs = this.chartGroup.selectAll("path")
      .data(this.pie(classDistribution))
      .enter()
      .append("path")
      .attr("d", this.arc)
      .attr("fill", d => this.color(d.data.label))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // labels in legend
    const labels = this.chartGroup.selectAll(".legend-label")
      .data(classDistribution)
      .enter()
      .append("text")
      .attr("class", "legend-label")
      .attr("x", legendX + this.dotSize + this.legendTextLeftMargin)
      .attr("y", (d, i) => legendYStart + i * this.legendMargin + this.dotSize)
      .text(d => `${d.label}, ${d.value} %`)
      .style("font-size", `${this.dotSize}px`)
      .style("font-weight", "normal");

    // dots in legend
    const dots = this.chartGroup.selectAll(".legend-dot")
      .data(classDistribution)
      .enter()
      .append("rect")
      .attr("class", "legend-dot")
      .attr("x", legendX)
      .attr("y", (d, i) => legendYStart + i * this.legendMargin)
      .attr("width", this.dotSize)
      .attr("height", this.dotSize)
      .style("fill", d => this.color(d));

    // common function for highlighting segment and label in legend
    const highlight = (d, highlightOn) => {
      const [cx, cy] = this.arc.centroid(d);
      const angle = Math.atan2(cy, cx);
      const offset = highlightOn ? 10 : 0;

      // translate of segment
      arcs.filter(a => a.data.label === d.data.label)
        .transition()
        .duration(200)
        .attr("transform", `translate(${Math.cos(angle) * offset}, ${Math.sin(angle) * offset})`);

      // bold text in legend
      labels.filter(l => l.label === d.data.label)
        .transition()
        .duration(200)
        .style("font-weight", highlightOn ? "bold" : "normal");
    };

    // hover to segment
    arcs.on("mouseover", (event, d) => highlight(d, true))
      .on("mouseout", (event, d) => highlight(d, false));

    // hover to label
    labels.on("mouseover", (event, d) => {
      const pieDatum = this.pie(classDistribution).find(p => p.data.label === d.label);
      highlight(pieDatum, true);
    })
      .on("mouseout", (event, d) => {
        const pieDatum = this.pie(classDistribution).find(p => p.data.label === d.label);
        highlight(pieDatum, false);
      });
  }


  // return max width of key in legend including percentage
  getLegendMaxWidth(distribution) {
    let canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${this.dotSize}px sans-serif`;

    let maxTextWidth = 0;
    distribution.forEach(d => {
      const width = context.measureText(`${d.label}, ${d.value} %`).width;
      if (width > maxTextWidth) maxTextWidth = width;
    });
    canvas = null;
    return maxTextWidth + this.dotSize + this.legendTextLeftMargin;
  }
}