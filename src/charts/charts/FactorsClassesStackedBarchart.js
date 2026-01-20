/**
 * @fileoverview Defines a FactorsClassesStackedBarchart component that visualizes the distribution of classes within a dataset.
 * Utilizes D3.js for rendering and interactive visualization.
 * 
 * @requires d3 - D3.js library for manipulating documents based on data.
 */

// FactorsClassesStackedChart.js
import * as d3 from "d3";
import { DataStore } from "../DataStore.js";


export default class FactorsClassesStackedBarchart {

    constructor(element, dataStore, height = 500, isZoomable = true) {
        this.element = element;
        this.dataStore = dataStore;

        this.legendSize = 15;

        this.margin = { top: 0, right: 0, bottom: 0, left: 0 };

        console.log(dataStore);

        const distribution = this.dataStore.getFactorsClassesDistributionInNumbers();

        this.margin.left = this.getYAxisMaxWidth(distribution);
        this.margin.bottom = this.legendSize + 20;
        this.margin.top = this.margin.bottom / 2;
        this.margin.right = this.margin.left / 2;

        // calculate max width for SVG
        const columnWidth = 40; // approximate px for one column - strech svg
        const totalWidth = distribution.length * columnWidth + this.margin.left + this.margin.right;

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
        const tooltipBackground = "rgba(0,0,0,0.7)";
        const tooltipColor = "#fff";
        const tooltipRadius = "4px";
        const tooltipFontSize = "14px";

        const factorsClassesDistribution =
            this.dataStore.getFactorsClassesDistributionInNumbers();


        // stack data
        const stackedData = factorsClassesDistribution.map(f => {
            const row = { factorIdx: f.factorIdx + 1 };
            f.distribution.forEach(d => {
                row[d.label] = d.value;
            });
            return row;
        });

        const classKeys =
            factorsClassesDistribution[0].distribution.map(d => d.label);

        const stack = d3.stack().keys(classKeys);
        const series = stack(stackedData);



        // scales
        const x = d3.scaleBand()
            .domain(stackedData.map(d => d.factorIdx))
            .range([0, this.innerWidth])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain([
                0,
                d3.max(stackedData, d =>
                    d3.sum(classKeys, k => d[k])
                )
            ])
            .range([this.innerHeight, 0]);

        // tooltip
        this.tooltip = d3.select(this.element)
            .append("div")
            .style("position", "absolute")
            .style("padding", "0.5em")
            .style("background", tooltipBackground)
            .style("color", tooltipColor)
            .style("border-radius", tooltipRadius)
            .style("pointer-events", "none")
            .style("font-size", tooltipFontSize)
            .style("display", "none");


        const colorScale = d3.scaleOrdinal()
            .domain(classKeys)
            .range(classKeys.map((_, i) =>
                d3.interpolateRainbow(i / classKeys.length)
            ));

        // segments in bar
        const layers = this.chartGroup
            .selectAll("g.layer")
            .data(series)
            .join("g")
            .attr("class", "layer")
            .attr("fill", d => colorScale(d.key));


        layers.selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", d => x(d.data.factorIdx))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
            .on("mouseover", (event, d) => {
                const className = event.currentTarget.parentNode.__data__.key;
                const value = d.data[className];

                this.tooltip
                    .style("display", "block")
                    .html(`
                    <strong>Factor:</strong> ${d.data.factorIdx}<br/>
                    <strong>Class:</strong> ${className}<br/>
                    <strong>No. objects:</strong> ${value}
                `);

                d3.select(event.currentTarget)
                    .attr("fill-opacity", 0.6);
            })
            .on("mousemove", event => {
                this.tooltip
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mouseout", event => {
                d3.select(event.currentTarget)
                    .attr("fill-opacity", 1);

                this.tooltip.style("display", "none");
            });


        // Axes
        const xAxis = d3.axisBottom(x);
        this.chartGroup.append("g")
            .attr("transform", `translate(0, ${this.innerHeight})`)
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", `${this.legendSize}px`);

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
            let sum = d3.sum(d.distribution, d => d.value);
            let w = ctx.measureText(String(sum)).width;
            if (w > maxWidth) maxWidth = w;
        });

        return maxWidth + 20; // for ticks
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

        return maxWidth;
    }
}