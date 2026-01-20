import * as d3 from "d3";

export default class FactorsSimilarityHeatmap {
    constructor(
        element,
        dataStore,
        height = 500,
        similarity = "jaccard",
        calcObj = true
    ) {
        this.element = element;
        this.dataStore = dataStore;
        this.similarity = similarity;
        this.calcObj = calcObj;
        this.height = height;

        this.factors = this.dataStore.getFactors();
        this.noOfFactors = this.factors.length;

        this.attributes = this.dataStore.getAttributes();
        this.objects = this.dataStore.getObjects();

        this.cellSize = 20;
        this.gap = 2;

        this.attributeSize = 4;
        this.objectSize = 4;

        this.headerHeight = this.attributeSize * this.cellSize;
        this.headerWidth = this.objectSize * this.cellSize;

        this.matrixSize =
            this.noOfFactors * (this.cellSize + this.gap);

        this.similarityMatrix =
            this.calculateSimilarityMatrix(this.similarity);

        this.initDOM();
        this.initSVG();
        this.render();
    }

    /* ------------------ similarity ------------------ */

    calculateSimilarity(similarity, f1, f2) {
        let setA, setB, total;

        if (this.calcObj !== true) {
            setA = new Set(f1.attributes);
            setB = new Set(f2.attributes);
            total = this.attributes.length;
        } else {
            setA = new Set(f1.objects);
            setB = new Set(f2.objects);
            total = this.objects.length;
        }

        if (similarity === "jaccard") {
            const intersection =
                [...setA].filter(x => setB.has(x)).length;
            const union =
                new Set([...setA, ...setB]).size;
            return union === 0 ? 0 : intersection / union;
        }

        if (similarity === "smc") {
            const intersection =
                [...setA].filter(x => setB.has(x)).length;
            const union =
                new Set([...setA, ...setB]);
            const zeros = total - union.size;
            return (intersection + zeros) / total;
        }
    }

    calculateSimilarityMatrix(similarity) {
        const matrix = [];
        for (let i = 0; i < this.noOfFactors; i++) {
            matrix[i] = [];
            for (let j = 0; j < this.noOfFactors; j++) {
                matrix[i][j] = this.calculateSimilarity(
                    similarity,
                    this.factors[i],
                    this.factors[j]
                );
            }
        }
        return matrix;
    }

    /* ------------------ DOM ------------------ */

    initDOM() {
        this.element.innerHTML = `
        <div class="heatmap-wrapper" style="
            width: 100%;
            height: ${this.height}px;
            overflow: auto;
            border: 1px solid #e5e7eb;
        ">
            <svg id="heatmap-svg"></svg>
        </div>
    `;

        this.svg = d3.select("#heatmap-svg");

        this.tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("background", "rgba(0,0,0,0.7)")
            .style("color", "#fff")
            .style("padding", "5px")
            .style("border-radius", "4px")
            .style("font-size", "12px");
    }


    /* ------------------ SVG ------------------ */

    initSVG() {
        const width =
            this.headerWidth + this.matrixSize;
        const height =
            this.headerHeight + this.matrixSize;

        this.svg
            .attr("width", width)
            .attr("height", height);

        // drawing layers
        this.gAttributes = this.svg.append("g")
            .attr(
                "transform",
                `translate(${this.headerWidth}, 0)`
            );

        this.gObjects = this.svg.append("g")
            .attr(
                "transform",
                `translate(0, ${this.headerHeight})`
            );

        this.gMatrix = this.svg.append("g")
            .attr(
                "transform",
                `translate(${this.headerWidth}, ${this.headerHeight})`
            );
    }

    /* ------------------ render ------------------ */

    render() {
        this.renderAttributes();
        this.renderObjects();
        this.renderMatrix();
    }

    /* ------------------ factors (top) ------------------ */

    renderAttributes() {
        const padding = 5;

        const g = this.gAttributes
            .selectAll("g.attr")
            .data(this.factors)
            .join("g")
            .attr("class", "attr")
            .attr(
                "transform",
                (d, i) =>
                    `translate(${i * (this.cellSize + this.gap)}, 0)`
            );

        g.append("rect")
            .attr("width", this.cellSize)
            .attr("height", this.headerHeight)
            .attr("fill", "white")
            .attr("stroke", "#ddd");

        g.append("text")
            .attr("x", this.cellSize / 2)
            .attr("y", this.headerHeight - padding)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "middle")
            .attr(
                "transform",
                `rotate(-90, ${this.cellSize / 2}, ${this.headerHeight - padding})`
            )
            .text((d, i) => i + 1);
    }

    /* ------------------ factors (left) ------------------ */

    renderObjects() {
        const padding = 5;

        const g = this.gObjects
            .selectAll("g.obj")
            .data(this.factors)
            .join("g")
            .attr("class", "obj")
            .attr(
                "transform",
                (d, i) =>
                    `translate(0, ${i * (this.cellSize + this.gap)})`
            );

        g.append("rect")
            .attr("width", this.headerWidth)
            .attr("height", this.cellSize)
            .attr("fill", "white")
            .attr("stroke", "#ddd");

        g.append("text")
            .attr("x", this.headerWidth - padding)
            .attr("y", this.cellSize / 2)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .text((d, i) => i + 1);
    }

    /* ------------------ heatmap ------------------ */

    renderMatrix() {
        const color = d3.scaleSequential()
            .domain([0, 1])
            .interpolator(d3.interpolateYlGnBu);

        const flatData = this.similarityMatrix.flatMap(
            (row, r) =>
                row.map((value, c) => ({
                    value,
                    r,
                    c
                }))
        );

        this.gMatrix
            .selectAll("rect")
            .data(flatData)
            .join("rect")
            .attr(
                "x",
                d => d.c * (this.cellSize + this.gap)
            )
            .attr(
                "y",
                d => d.r * (this.cellSize + this.gap)
            )
            .attr("width", this.cellSize)
            .attr("height", this.cellSize)
            .attr("fill", d => color(d.value))
            .attr("stroke", "#ccc")
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget)
                    .attr("stroke", "red")
                    .attr("stroke-width", 2);

                this.tooltip
                    .style("opacity", 1)
                    .html(`
                        <b>X:</b> ${d.c + 1}<br/>
                        <b>Y:</b> ${d.r + 1}<br/>
                        <b>Similarity:</b> ${d.value.toFixed(2)}
                    `);
            })
            .on("mousemove", event => {
                this.tooltip
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px");
            })
            .on("mouseout", event => {
                d3.select(event.currentTarget)
                    .attr("stroke", "#ccc")
                    .attr("stroke-width", 1);
                this.tooltip.style("opacity", 0);
            });
    }
}