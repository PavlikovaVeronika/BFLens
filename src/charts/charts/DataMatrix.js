import * as d3 from "d3";

export default class DataMatrix {
    constructor(element, dataStore, height = 500) {
        this.element = element;

        this.dataStore = dataStore;
        this.data = this.dataStore.getData();
        this.factors = this.dataStore.getFactors();

        this.noOfRows = this.data.length;
        this.noOfCols = this.data[0].length;


        this.objectsLabels = this.dataStore.getObjects();
        this.attributesLabels = this.dataStore.getAttributes();

        this.classes = this.dataStore.getClasses();
        this.classesLabels = this.dataStore.getClassDescription();

        // basic settings
        this.cellSize = 20;
        this.visibleCells = 50;
        this.gap = 2;
        this.objectSize = 4;
        this.attributeSize = 4;

        this.height = height;

        this.activeFactor = null;
        this.tooltip = null;

        this.initDOM();
        this.initSVG();
        this.renderContext();
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

        this.scrollableContainer.addEventListener("scroll", (event) => {
            const scrollX = this.scrollableContainer.scrollLeft;
            const scrollY = this.scrollableContainer.scrollTop;
            this.renderContext(scrollX, scrollY);
        });
    }

    initSVG() {
        //this.maxAttrHeight = d3.max(this.attributesLabels, d => this.measureText(d).width) + 20;
        //this.maxObjWidth = d3.max(this.objectsLabels, d => this.measureText(d).width) + 20;

        this.maxAttrHeight = this.attributeSize * this.cellSize; 
        this.maxObjWidth = this.objectSize * this.cellSize;

        this.svgContext
            .attr("width", (this.noOfCols * this.cellSize) + (this.gap * this.noOfCols))
            .attr("height", (this.noOfRows * this.cellSize) + (this.gap * this.noOfRows));

        this.svgAttributes
            .attr("width", (this.noOfCols * this.cellSize) + (this.gap * this.noOfCols))
            .attr("height", this.maxAttrHeight);

        this.svgObjects
            .attr("width", this.objectSize * this.cellSize)
            .attr("height", (this.noOfRows * this.cellSize) + (this.gap * this.noOfRows));



        // adjust visible cells according to width of the element
        this.panelContainer = this.element.querySelector(".panel_content");
        const objectNode = this.svgObjects.node();

        const objectWidth = parseFloat(getComputedStyle(objectNode).width);
        const panelWidth = this.panelContainer.offsetWidth;
        const remainingWidth = panelWidth - objectWidth;

        const objectHeight = parseFloat(getComputedStyle(objectNode).width);
        const panelHeight = this.panelContainer.offsetHeight;
        const remainingHeight = panelHeight - objectHeight;

        const visiblePart = Math.max(remainingWidth, remainingHeight);

        this.visibleCells = visiblePart / this.cellSize;

    }

    renderContext(scrollX = 0, scrollY = 0) {

        const startX = Math.floor(scrollX / (this.cellSize + this.gap));
        const startY = Math.floor(scrollY / (this.cellSize + this.gap));
        const endX = Math.min(this.noOfCols, startX + this.visibleCells);
        const endY = Math.min(this.noOfRows, startY + this.visibleCells);

        console.log(startX, startY, endX, endY)

        // clear old render
        this.svgContext.selectAll("rect").remove();
        this.svgContext.selectAll("circle").remove();
        this.svgObjects.selectAll("rect").remove();
        this.svgObjects.selectAll("text").remove();
        this.svgAttributes.selectAll("rect").remove();
        this.svgAttributes.selectAll("text").remove();

        this.renderAttributes(startX, endX);
        this.renderObjects(startY, endY);
        this.renderCells(startY, endY, startX, endX);

        if (!this.tooltip && this.classes) this.initTooltip();
        if (this.activeFactor) this.markFactorWithColor(true);
    }

    renderAttributes() {
        const padding = 4; // mezera od spodního kraje rectu

        const data = d3.range(this.attributesLabels.length);

        // recty
        this.svgAttributes
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => d * (this.cellSize + this.gap) + this.gap)
            .attr("y", 0)
            .attr("width", this.cellSize)
            .attr("height", this.maxAttrHeight)
            .attr("fill", "white")
            .attr("id", d => "attribute-" + d);

        // texty
        this.svgAttributes
            .selectAll("text")
            .data(data)
            .join("text")
            .attr("x", d => d * (this.cellSize + this.gap)) // levý okraj
            .attr("y", this.maxAttrHeight)
            .attr("text-anchor", "start")
            .attr("alignment-baseline", "middle")
            .attr(
                "transform",
                d => `rotate(-90, ${d * (this.cellSize + this.gap) + this.gap}, ${this.maxAttrHeight - (this.cellSize / 2)})`
            )
            .text(d => this.attributesLabels[d]);
    }


    renderObjects(startY, endY) {
        for (let rowIndex = startY; rowIndex < endY; rowIndex++) {
            this.svgObjects.append("rect")
                .attr("x", 0)
                .attr("y", rowIndex * (this.cellSize + this.gap) + this.gap)
                .attr("width", this.cellSize * this.objectSize)
                .attr("height", this.cellSize)
                .attr("fill", "white")
                .attr("id", "object-" + rowIndex);

            this.svgObjects.append("text")
                .attr("x", this.cellSize * this.objectSize - this.cellSize / 3)
                .attr("y", rowIndex * (this.cellSize + this.gap) + this.cellSize / 2 + this.gap)
                .attr("text-anchor", "end")
                .attr("alignment-baseline", "middle")
                .text(this.objectsLabels[rowIndex])
                .on("mouseover", (event) => {
                    if (this.tooltip) {
                        this.tooltip.style("opacity", 1)
                            .html(`Class: ${this.classesLabels[this.classes[rowIndex]]}`);
                    }
                })
                .on("mousemove", (event) => {
                    if (this.tooltip) {
                        this.tooltip.style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 20) + "px");
                    }
                })
                .on("mouseout", () => {
                    if (this.tooltip) {
                        this.tooltip.style("opacity", 0);
                    }
                });
        }
    }

    renderCells(startY, endY, startX, endX) {
        const markColor = "#fff176";

        const cellSizeGap = this.cellSize + this.gap;
        for (let rowIndex = startY; rowIndex < endY; rowIndex++) {
            for (let colIndex = startX; colIndex < endX; colIndex++) {
                const value = this.data[rowIndex][colIndex];
                const rect = this.svgContext.append("rect")
                    .attr("x", (colIndex * this.cellSize) + (this.gap * colIndex) + this.gap)
                    .attr("y", (rowIndex * this.cellSize) + (this.gap * rowIndex) + this.gap)
                    .attr("width", this.cellSize)
                    .attr("height", this.cellSize)
                    .attr("fill", value ? "black" : "white")
                    .attr("id", rowIndex + "-" + colIndex)
                    .attr("data-flag", value ? 1 : 0)
                    .on("mouseover", (event, d) => {
                        if (!this.activeFactor) {
                            const rect = d3.select(event.currentTarget);

                            d3.select("#object-" + rowIndex)
                                .attr("fill", markColor);
                            d3.select("#attribute-" + (colIndex - startX))
                                .attr("fill", markColor);
                            rect.attr("fill", markColor);
                        }
                    })
                    .on("mouseout", (event, d) => {
                        if (!this.activeFactor) {
                            const rect = d3.select(event.currentTarget);
                            d3.select("#object-" + rowIndex)
                                .attr("fill", "white");
                            d3.select("#attribute-" + (colIndex - startX))
                                .attr("fill", "white");
                            rect
                                .attr("fill", value ? "black" : "white");
                            d3.select(rect.parentNode).selectAll(".highlight-star").remove();
                        }
                    });

                if (value) {
                    this.svgContext.append("circle")
                        .attr("cx", colIndex * cellSizeGap + this.cellSize / 2 + this.gap)
                        .attr("cy", rowIndex * cellSizeGap + this.cellSize / 2 + this.gap)
                        .attr("r", this.cellSize / 4)
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("stroke-width", 2)
                        .attr("pointer-events", "none");
                }
            }
        }
    }

    initTooltip() {
        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("background", "#fff176")
            .style("padding", "5px")
            .style("border-radius", "4px")
            .style("font-size", "12px");
    }

    markFactor(factorIdx, mark) {
        if (mark) {
            // unmark active factor
            if (this.activeFactor) {
                this.markFactorWithColor(false);
            }
            this.activeFactor = this.factors[factorIdx];
            this.markFactorWithColor(mark);
        } else {
            this.markFactorWithColor(mark);
            this.activeFactor = null;
        }
    }

    markFactorWithColor(fill) {
        const color = "#fff3b0";
        const objects = this.activeFactor.objects;
        const attributes = this.activeFactor.attributes;

        this.svgObjects.selectAll("rect")
            .filter(function () {
                const id = this.getAttribute("id");
                const number = parseInt(id.split("-")[1], 10);
                return objects.includes(number);
            })
            .attr("fill", fill ? color : "white");

        this.svgAttributes.selectAll("rect")
            .filter(function () {
                const id = this.getAttribute("id");
                const number = parseInt(id.split("-")[1], 10);
                return attributes.includes(number);
            })
            .attr("fill", fill ? color : "white");

        this.svgContext.selectAll("rect")
            .filter(function () {
                const id = this.getAttribute("id");
                const [rowStr, colStr] = id.split("-");
                const row = parseInt(rowStr, 10);
                const col = parseInt(colStr, 10);
                return objects.includes(row) && attributes.includes(col);
            })
            .attr("fill", function () {
                if (fill) return color;
                return this.getAttribute("data-flag") === "1" ? "black" : "white";
            });
    }

    measureText(text) {
        const font = "14px sans-serif"
        if (!this._canvas) {
            this._canvas = document.createElement("canvas");
            this._context = this._canvas.getContext("2d");
        }
        this._context.font = font;
        const metrics = this._context.measureText(text);
        return { width: metrics.width, height: parseInt(font, 10) };
    }

}