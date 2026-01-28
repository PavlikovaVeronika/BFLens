/**
 * @fileoverview Defines a FactorClassStackedBarchart component that visualizes the distribution of classes within a dataset.
 * Utilizes D3.js for rendering and interactive visualization.
 * 
 * @requires d3 - D3.js library for manipulating documents based on data.
 */

// FactorClassStackedChart.js
import * as d3 from "d3";
import { DataStore } from "../DataStore.js";


export default class FactorClassStackedBarchart {

  constructor(element, factorIdx, dataStore, height = 500, isZoomable = true, selectAll = true) {
    this.element = element;
    this.dataStore = dataStore;
    this.factorIdx = factorIdx;
    this.selectAll = selectAll;

    this.legendSize = 15;

    this.margin = { top: 0, right: 0, bottom: 0, left: 0 };

    let distribution = this.dataStore.getFactorClassDistributionInNumbers(this.factorIdx);

    if (!selectAll) {
      distribution = distribution.filter(d => d.value > 0);
    }

    this.margin.left = this.getYAxisMaxWidth(distribution);
    this.margin.bottom = this.getXAxisMaxHeight(distribution);
    this.margin.top = this.margin.bottom / 2;
    this.margin.right = this.margin.left / 2;

    // calculate max width for SVG
    const columnWidth = 40; // approximate px for one column - strech svg
    const padding = 5;
    const totalWidth = distribution.length * (columnWidth + padding);


    this.width = totalWidth + this.margin.left + this.margin.right;
    this.height = height;

    this.element.innerHTML = `
      <svg width="${this.width}" height="${this.height}"></svg>
    `;
    this.svg = d3.select(this.element).select("svg");

    this.innerWidth = this.width - this.margin.left - this.margin.right;
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;

    this.chartGroup = this.svg.append("g")
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

    //zoom
    if (isZoomable) {
      this.zoomBehavior = d3.zoom()
        .scaleExtent([0.5, 1.5])
        .on("zoom", (event) => {
          this.chartGroup.attr("transform", event.transform);
        });

      this.svg.call(this.zoomBehavior);

      this.svg.call(
        this.zoomBehavior.transform,
        d3.zoomIdentity.translate(this.margin.left, this.margin.top)
      );
    }

    this.draw();
  }

  draw() {
    let factorColor = "#41b8d5";
    let overallColor = "#2d8bba";
    let tooltipBackground = "rgba(0,0,0,0.7)";
    let tooltipColor = "#fff";
    let tooltipRadius = "4px";
    let tooltipFontSize = "14px";

    const factorClassDistribution = this.dataStore.getFactorClassDistributionInNumbers(this.factorIdx);
    const classDistribution = this.dataStore.getClassDistributionInNumbers();

    let merged = classDistribution.map((d, i) => ({
      label: d.label,
      overall: d.value,
      factor: factorClassDistribution[i].value
    }));

    if (!this.selectAll) {
      merged = merged.filter(d => d.factor > 0);
    }

    const x = d3.scaleBand()
      .domain(merged.map(d => d.label))
      .range([0, this.innerWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(merged, d => d.overall)])
      .range([this.innerHeight, 0]);

    // tooltip
    this.tooltip = d3.select("body")
      .append("div")
      .style("position", "absolute")
      .style("padding", "0.5em 0.5em")
      .style("background", tooltipBackground)
      .style("color", tooltipColor)
      .style("border-radius", tooltipRadius)
      .style("pointer-events", "none")
      .style("font-size", tooltipFontSize)
      .style("display", "none");

    // bars 
    const bars = this.chartGroup.selectAll("g.bar")
      .data(merged)
      .join("g")
      .attr("class", "bar")
      .attr("transform", d => `translate(${x(d.label)},0)`);

    // lower part - factor
    bars.append("rect")
      .attr("class", "factor")
      .attr("x", 0)
      .attr("y", d => y(d.factor))
      .attr("width", x.bandwidth())
      .attr("height", d => this.innerHeight - y(d.factor))
      .attr("fill", factorColor)
      .on("mouseover", (event, d) => {
        this.tooltip
          .style("display", "block")
          .html(`Number of objects in factor: ${d.factor}`);

        d3.select(event.currentTarget)
          .attr("fill-opacity", 0.5);
      })
      .on("mousemove", (event) => {
        this.tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY + 10) + "px");
      })
      .on("mouseout", () => {
        d3.select(event.currentTarget)
          .attr("fill-opacity", 1);

        this.tooltip.style("display", "none");
      });

    // upper part - rest
    bars.append("rect")
      .attr("class", "rest")
      .attr("x", 0)
      .attr("y", d => y(d.overall))
      .attr("width", x.bandwidth())
      .attr("height", d => this.innerHeight - y(d.overall - d.factor))
      .attr("fill", overallColor)
      .on("mouseover", (event, d) => {
        this.tooltip
          .style("display", "block")
          .html(`Overall number of objects: ${d.overall}`);

        d3.select(event.currentTarget)
          .attr("fill-opacity", 0.5);
      })
      .on("mousemove", (event) => {
        this.tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY + 10) + "px");
      })
      .on("mouseout", () => {
        d3.select(event.currentTarget)
          .attr("fill-opacity", 1);

        this.tooltip.style("display", "none");
      });

    // X axis
    const xAxis = d3.axisBottom(x);
    this.chartGroup.append("g")
      .attr("transform", `translate(0, ${this.innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("class", "axis--x")
      .attr("data-label", d => d)
      .style("font-size", `${this.legendSize}px`)
      .style("text-anchor", "end")
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .style("font-weight", "bold");

        this.chartGroup.selectAll("g.bar")
          .filter(b => b.label === d)
          .selectAll("rect")
          .attr("fill-opacity", 0.5);
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget)
          .style("font-weight", null);

        this.chartGroup.selectAll("g.bar")
          .filter(b => b.label === d)
          .selectAll("rect")
          .attr("fill-opacity", 1);
      });

    // Y axis
    const yAxis = d3.axisLeft(y);
    this.chartGroup.append("g")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", `${this.legendSize}px`);
  }



  getYAxisMaxWidth(distribution) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    ctx.font = `${this.legendSize}px sans-serif`

    let maxWidth = 0;

    distribution.forEach(d => {
      const w = ctx.measureText(String(d.value)).width;
      if (w > maxWidth) maxWidth = w;
    });

    return maxWidth + 20; // for ticks
  }

  getXAxisMaxHeight(distribution) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    ctx.font = `${this.legendSize}px sans-serif`

    let maxSize = 0;

    distribution.forEach(d => {
      const text = String(d.label);
      const m = ctx.measureText(text);

      const rotatedHeight = m.width * 0.7; // sin(45°) ≈ 0.7
      if (rotatedHeight > maxSize) maxSize = rotatedHeight;
    });

    return maxSize + 20; // for ticks
  }
}