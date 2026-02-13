/**
 * @fileoverview Defines a FactorAttributeBarchart component that visualizes the distribution of objects within a dataset.
 * Utilizes D3.js for rendering and interactive visualization.
 * 
 * @requires d3 - D3.js library for manipulating documents based on data.
 */

// FactorClassStackedChart.js
import * as d3 from "d3";
import { DataStore } from "../DataStore.js";


export default class FactorsObjectBarchart {

    constructor(element, dataStore, height = 500, isZoomable = true) {
        this.element = element;
        this.dataStore = dataStore;

        this.factors = this.dataStore.getFactors();
        this.distribution = this.factors.map((factor, i) => ({
            label: `${i + 1}`,
            value: factor.objects.length
        }));

        this.legendSize = 15;

        this.margin = { top: 0, right: 0, bottom: 0, left: 0 };

        this.margin.left = this.getYAxisMaxWidth(this.distribution);
        this.margin.bottom = this.getXAxisMaxHeight(this.distribution);
        this.margin.top = this.margin.bottom / 2;
        this.margin.right = this.margin.left / 2;


        // calculate max width for SVG
        const columnWidth = 40; // approximate px for one column - strech svg
        const padding = 5;
        const totalWidth = this.distribution.length * (columnWidth + padding);


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
        const factorColor = "#41b8d5";

        const factors = this.factors;

        const data = this.distribution;

        const x = d3.scaleBand()
            .domain(data.map(d => d.label))
            .range([0, this.innerWidth])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .nice()
            .range([this.innerHeight, 0]);

        // tooltip
        this.tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("padding", "0.5em")
            .style("background", "rgba(0,0,0,0.7)")
            .style("color", "#fff")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("display", "none");

        // bars
        this.chartGroup.selectAll("g.bar")
            .data(data)
            .join("g")
            .attr("class", "bar")
            .attr("transform", d => `translate(${x(d.label)},0)`)
            .append("rect")
            .attr("x", 0)
            .attr("y", d => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", d => this.innerHeight - y(d.value))
            .attr("fill", factorColor)
            .on("mouseover", (event, d) => {
                this.tooltip
                    .style("display", "block")
                    .html(`Number of objects: ${d.value}`);

                d3.select(event.currentTarget)
                    .attr("fill-opacity", 0.5);
            })
            .on("mousemove", (event) => {
                this.tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", (event) => {
                d3.select(event.currentTarget)
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