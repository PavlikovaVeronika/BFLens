import * as d3 from "d3";

export default class FactorsSimilarityHeatmap {
    constructor(element, dataStore, height = 500, similarity = "jaccard", calcObj = true) {
        this.element = element;
        this.dataStore = dataStore;
        this.similarity = similarity;
        this.calcObj = calcObj;

        this.factors = this.dataStore.getFactors();
        this.noOfFactors = this.factors.length;

        this.attributes = this.dataStore.getAttributes();
        this.objects = this.dataStore.getObjects();

        this.cellSize = 20;
        this.gap = 2;
        this.height = height;
        this.activeFactor = null;
        this.tooltip = null;

        this.objectSize = 4;
        this.attributeSize = 4;

        this.similarityMatrix = this.calculateSimilarityMatrix(this.similarity);

        this.initDOM();
        this.initSVG();
        this.renderHeatmap();

    }

    calculateSimilarity(similarity, f1, f2) {

        let setA, setB, total;
        if(this.calcObj != true) {
            setA = new Set(f1.attributes);
            setB = new Set(f2.attributes);
            total = this.attributes.length;
        } else {
            setA = new Set(f1.objects);
            setB = new Set(f2.objects);
            total = this.objects.length;
        }

        if (similarity == "jaccard") {
            const intersection = new Set([...setA].filter(x => setB.has(x))).size;
            const union = new Set([...setA, ...setB]).size;
            return union === 0 ? 0 : intersection / union;
        } else if (similarity == "smc") {
            const intersection = new Set([...setA].filter(x => setB.has(x))).size; // 1/1
            const union = new Set([...setA, ...setB]);
            const zeros = total - union.size; // 0/0

            return (intersection + zeros) / total;
        }
    }

    calculateSimilarityMatrix(similarity) {
        const matrix = [];
        for (let i = 0; i < this.noOfFactors; i++) {
            matrix[i] = [];
            for (let j = 0; j < this.noOfFactors; j++) {
                matrix[i][j] = this.calculateSimilarity(similarity, this.factors[i], this.factors[j]);
            }
        }
        return matrix;
    }

    initDOM() {
        this.element.innerHTML = `
            <div class="panels" style="display: grid; overflow: hidden; grid-template-areas: 'panel_1' 'tab_1'; gap: 0 1rem;">
                <div class="panel" style="overflow: auto; display: grid; gap: 1rem;">
                    <div class="panel_content" style="background-color: white; overflow: auto; scrollbar-width: thin; display: grid;">
                        <div class="panel_content__content context" style="display: grid; grid-template-columns: min-content auto; grid-template-rows: min-content auto; grid-template-areas: 'corner attributes' 'objects data'; gap: 0; position: relative; background-color: oklch(98.5% 0.001 106.423); overflow: auto; border: 1px solid #e5e7eb; border-radius: 0.25rem;">
                            
                            <div id="corner" style="grid-area: corner; background-color: white; position: sticky; top: 0; left: 0; z-index: 1000;"></div>
                            
                            <svg id="context__attributes" style="grid-area: attributes; position: sticky; top: 0; left: 0; background-color: oklch(98.5% 0.001 106.423);"></svg>
                            
                            <svg id="context__objects" style="grid-area: objects; position: sticky; left: 0; background-color: oklch(98.5% 0.001 106.423);"></svg>
                            
                            <div class="scroll-container" style="grid-area: data; scrollbar-width: thin;">
                                <svg id="context__data"></svg>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        `;

        if (this.height > 0) {
            this.element.querySelector(".panels").style.height = `${this.height}px`;
        }

        this.container = this.element.querySelector(".scroll-container");
        this.svgContext = d3.select("#context__data");
        this.svgAttributes = d3.select("#context__attributes");
        this.svgObjects = d3.select("#context__objects");
        this.scrollableContainer = this.element.querySelector(".panel_content__content");

        /*
        this.container = this.element.querySelector(".heatmap-container");
        this.svg = d3.select("#heatmap");
        */

        // tooltip
        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("background", "rgba(0,0,0,0.7)")
            .style("color", "#fff")
            .style("padding", "5px")
            .style("border-radius", "4px")
            .style("font-size", "12px");

    }

    initSVG() {
        /*
        const size = this.cellSize * this.noOfFactors + this.gap * this.noOfFactors;
        this.svg
            .attr("width", size)
            .attr("height", size);
            */

        this.svgContext
            .attr("width", (this.noOfFactors * this.cellSize) + (this.gap * this.noOfFactors))
            .attr("height", (this.noOfFactors * this.cellSize) + (this.gap * this.noOfFactors));

        this.svgAttributes
            .attr("width", (this.noOfFactors * this.cellSize) + (this.gap * this.noOfFactors))
            .attr("height", this.attributeSize * this.cellSize);

        this.svgObjects
            .attr("width", this.objectSize * this.cellSize)
            .attr("height", (this.noOfFactors * this.cellSize) + (this.gap * this.noOfFactors));
    }

    renderHeatmap() {
        this.renderAttributes();
        this.renderObjects();


        const color = d3.scaleSequential()
            .domain([0, 1])
            .interpolator(d3.interpolateYlGnBu);

        const flatData = this.similarityMatrix.flatMap((row, r) =>
            row.map((value, c) => ({ value, row: r, col: c }))
        );


        this.svgContext
            .selectAll("rect")
            .data(flatData)
            .join("rect")
            .attr("width", this.cellSize)
            .attr("height", this.cellSize)
            .attr("x", d => d.col * (this.cellSize + this.gap))
            .attr("y", d => d.row * (this.cellSize + this.gap))
            .attr("fill", d => color(d.value))
            .attr("stroke", "#ccc")
            .on("mouseover", (event, d) => {
                d3.select(event.currentTarget)
                    .attr("stroke", "red")
                    .attr("stroke-width", 2);

                this.tooltip
                    .style("opacity", 1)
                    .html(`
                <b>Factor X:</b> ${d.col + 1}<br/>
                <b>Factor Y:</b> ${d.row + 1}<br/>
                <b>Similarity:</b> ${d.value.toFixed(2)}
            `);
            })
            .on("mousemove", (event) => {
                this.tooltip
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px");
            })
            .on("mouseout", (event) => {
                d3.select(event.currentTarget)
                    .attr("stroke", "#ccc")
                    .attr("stroke-width", 1);

                this.tooltip.style("opacity", 0);
            });

    }

    renderAttributes() {
        const padding = 5;

        // rects
        this.svgAttributes
            .selectAll("rect")
            .data(this.factors)
            .join("rect")
            .attr("x", (d, i) => i * (this.cellSize + this.gap) + this.gap)
            .attr("y", 0)
            .attr("width", this.cellSize)
            .attr("height", this.cellSize * this.attributeSize)
            .attr("fill", "white");

        // texts
        this.svgAttributes
            .selectAll("text")
            .data(this.factors)
            .join("text")
            .attr("x", (d, i) => i * (this.cellSize + this.gap) + this.cellSize / 2)
            .attr("y", this.cellSize * this.attributeSize - padding)
            .attr("alignment-baseline", "middle")
            .attr(
                "transform",
                (d, i) => `rotate(-90, ${i * (this.cellSize + this.gap) + this.cellSize / 2}, ${this.cellSize * this.attributeSize - padding})`
            )
            .text((d, i) => i + 1);
    }



    renderObjects() {
        const padding = 5; // mezera od pravého kraje rectu

        // recty
        this.svgObjects
            .selectAll("rect")
            .data(this.factors)
            .join("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * (this.cellSize + this.gap) + this.gap)
            .attr("width", this.cellSize * this.objectSize)
            .attr("height", this.cellSize)
            .attr("fill", "white");

        // texty
        this.svgObjects
            .selectAll("text")
            .data(this.factors)
            .join("text")
            .attr("x", () => (this.cellSize * this.objectSize) - padding)
            .attr("y", (d, i) => i * (this.cellSize + this.gap) + this.cellSize / 2)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .text((d, i) => i + 1);
    }
}