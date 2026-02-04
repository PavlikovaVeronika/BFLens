/**
 * @fileoverview Defines a FactorsScatterPlot component that visualizes the distribution of classes within a dataset.
 * Utilizes D3.js for rendering and interactive visualization.
 * 
 * @requires d3 - D3.js library for manipulating documents based on data.
 */

// FactorClassStackedChart.js
import * as d3 from "d3";
import { DataStore } from "../DataStore.js";


export default class FactorsScatterPlot {

    constructor(element, dataStore, height = 500, isZoomable = true) {
        this.element = element;
        this.dataStore = dataStore;

        this.legendSize = 15;

        this.margin = { top: 0, right: 0, bottom: 0, left: 0 };

        const factors = this.dataStore.getFactors();

        this.margin.left = this.getYAxisMaxWidth(factors);
        this.margin.bottom = this.getYAxisMaxWidth(factors) + 20;
        this.margin.top = this.margin.bottom / 2;
        this.margin.right = this.margin.left / 2;


        // calculate max width for SVG
        const columnWidth = 20;
        const padding = 5;
        const totalWidth = factors.length * (columnWidth + padding);

        const rect = this.element.getBoundingClientRect();
        const clientWidth = rect.width;

        let svgWidth = Math.max(clientWidth, totalWidth);


        this.width = totalWidth;
        this.height = height;

        this.element.innerHTML = `
            <svg width="${svgWidth}" height="${this.height}"></svg>
        `;
        this.svg = d3.select(this.element).select("svg");

        this.innerWidth = this.width - this.margin.left - this.margin.right;
        this.innerHeight = this.height - this.margin.top - this.margin.bottom;

        this.chartGroup = this.svg.append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        // zoom
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
        let tooltipBackground = "rgba(0,0,0,0.7)";
        let tooltipColor = "#fff";
        let tooltipRadius = "4px";
        let tooltipFontSize = "14px";

        const factors = this.dataStore.getFactors();

        const points = factors.map((d, i) => ({
            label: i,
            x: d.objects.length,
            y: d.attributes.length,
        }));

        // x and y scales
        const x = d3.scaleLinear()
            .domain([0, d3.max(points, d => d.x) + 1])
            .range([0, this.innerWidth - this.getXAxisMaxWidth(factors)])
            .nice();

        const y = d3.scaleLinear()
            .domain([0, d3.max(points, d => d.y) + 1])
            .range([this.innerHeight, 0])
            .nice();

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

        // scatter
        this.chartGroup.selectAll("circle.point")
            .data(points)
            .join("circle")
            .attr("class", "point")
            .attr("cx", d => x(d.x))
            .attr("cy", d => y(d.y))
            .attr("r", 6)
            .attr("fill", factorColor)
            .on("mouseover", (event, d) => {
                this.tooltip
                    .style("display", "block")
                    .html(`
          <div><b>Factor:</b> ${d.label + 1}</div>
          <div><b>Objects (X):</b> ${d.x}</div>
          <div><b>Attributes (Y):</b> ${d.y}</div>
        `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");

                d3.select(event.currentTarget)
                    .attr("r", 9)
                    .attr("fill-opacity", 0.7);
            })
            .on("mousemove", (event) => {
                this.tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", (event) => {
                d3.select(event.currentTarget)
                    .attr("r", 6)
                    .attr("fill-opacity", 1);

                this.tooltip.style("display", "none");
            });

        // X axis
        this.chartGroup.append("g")
            .attr("transform", `translate(0, ${this.innerHeight})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", `${this.legendSize}px`);

        // Y axis
        this.chartGroup.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", `${this.legendSize}px`);
    }



    getYAxisMaxWidth(factors) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        ctx.font = `${this.legendSize}px sans-serif`

        let maxWidth = 0;

        factors.forEach(f => {
            const w = ctx.measureText(String(f.attributes.length)).width;
            if (w > maxWidth) maxWidth = w;
        });

        return maxWidth + 40; // for ticks
    }

    getXAxisMaxWidth(factors) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        ctx.font = `${this.legendSize}px sans-serif`

        let maxWidth = 0;

        factors.forEach(f => {
            const w = ctx.measureText(String(f.objects.length)).width;
            if (w > maxWidth) maxWidth = w;
        });

        console.log(maxWidth);

        return maxWidth;
    }
}