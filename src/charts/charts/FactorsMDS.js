/**
 * @fileoverview Defines a FactorsScatterPlot component that visualizes the distribution of classes within a dataset.
 * Utilizes D3.js for rendering and interactive visualization.
 * 
 * @requires d3 - D3.js library for manipulating documents based on data.
 */

// FactorClassStackedChart.js
import * as d3 from "d3";
import { DataStore } from "../DataStore.js";


export default class FactorsMDS {

    constructor(element, dataStore, height = 500, isZoomable = true) {
        this.element = element;
        this.dataStore = dataStore;

        this.legendSize = 15;

        this.margin = { top: 0, right: 0, bottom: 0, left: 0 };

        this.factors = this.dataStore.getFactors();
        this.mds = this.dataStore.getMDS();

        this.margin.left = this.getYAxisMaxWidth(this.factors);
        this.margin.bottom = this.getYAxisMaxWidth(this.factors) + 20;
        this.margin.top = this.margin.bottom / 2;
        this.margin.right = this.margin.left / 2;


        // calculate max width for SVG
        const columnWidth = 20;
        const padding = 5;
        const totalWidth = this.factors.length * (columnWidth + padding);

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


        const mds = this.mds;
        if (mds.length > 0 && mds[0].length === 3) {
            //console.log("3D");
            //this.draw3D();
            this.draw2D();
        } else {
            this.draw2D();
        }
    }

    draw2D() {
        const factorColor = "#41b8d5";
        const tooltipBackground = "rgba(0,0,0,0.7)";
        const tooltipColor = "#fff";
        const tooltipRadius = "4px";
        const tooltipFontSize = "14px";

        const factors = this.factors;
        const mds = this.mds; // each factor [x, y]

        const points = factors.map((d, i) => ({
            label: i,
            x: mds[i][0],
            y: mds[i][1],
            z: mds[i][2],
        }));

        const x = d3.scaleLinear()
            .domain([d3.min(points, d => d.x), d3.max(points, d => d.x)])
            .range([0, this.innerWidth])
            .nice();

        const y = d3.scaleLinear()
            .domain([d3.min(points, d => d.y), d3.max(points, d => d.y)])
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

        // Draw points
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
                    <div><b>Coords:</b> [${d.x.toFixed(2)}, ${d.y.toFixed(2)}, ${d.z.toFixed(2)}]</div>
                `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mousemove", (event) => {
                this.tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", () => this.tooltip.style("display", "none"));

        // Labels
        this.chartGroup.selectAll("text.label")
            .data(points)
            .join("text")
            .attr("x", d => x(d.x) + 8)
            .attr("y", d => y(d.y) + 4)
            .text(d => d.label + 1)
            .style("font-size", `${this.legendSize}px`)
            .style("fill", "#000");

        // X & Y axes
        this.chartGroup.append("g")
            .attr("transform", `translate(0, ${this.innerHeight})`)
            .call(d3.axisBottom(x))
            .style("font-size", `${this.legendSize}px`);

        this.chartGroup.append("g")
            .call(d3.axisLeft(y))
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