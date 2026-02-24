/**
 * @fileoverview Defines a FactorsScatterPlot component that visualizes the distribution of classes within a dataset.
 * Utilizes D3.js for rendering and interactive visualization.
 * 
 * @requires d3 - D3.js library for manipulating documents based on data.
 */

// FactorClassStackedChart.js
import * as d3 from "d3";
import { DataStore } from "../DataStore.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';


export default class FactorsMDS {

    constructor(element, dataStore, height = 500, isZoomable = true, mdsTarget = "overlap", mdsViewTarget = "2D", activeFactorIdx = null) {
        this.element = element;
        this.dataStore = dataStore;

        this.factorColor = "#41b8d5";
        this.markColor = "#fcd600";
        this.activeFactorIdx = activeFactorIdx;

        this.legendSize = 15;

        this.margin = { top: 0, right: 0, bottom: 0, left: 0 };

        this.factors = this.dataStore.getFactors();
        const mdsStruct = this.dataStore.getMDS(mdsTarget);

        if (mdsStruct == null) {
            return;
        }

        this.mds = mdsStruct.mds;
        this.mdsViewTarget = mdsViewTarget;

        this.margin.left = this.getYAxisMaxWidth(this.factors);
        this.margin.bottom = this.getXAxisMaxWidth(this.factors) + 20;
        this.margin.top = this.margin.bottom / 2;
        this.margin.right = this.margin.left / 2;


        // calculate max width for SVG
        const columnWidth = 20;
        const padding = 5;
        const totalWidth = (this.factors.length * (columnWidth + padding));

        const rect = this.element.getBoundingClientRect();
        const clientWidth = rect.width;

        let svgWidth = Math.max(clientWidth, totalWidth);


        this.width = svgWidth;
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
        if (mds.length > 0 && mds[0].length === 3 && mdsViewTarget === "3D") {
            this.draw3D();
        } else {
            this.draw2D();
        }

        // handle active factor
        console.log(this.activeFactorIdx);
        if (this.activeFactorIdx != null) {
            this.markFactor(this.activeFactorIdx, true);
        }
    }

    draw2D() {
        const factorColor = this.factorColor;
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
            .domain([
                d3.min(points, d => d.x) - 0.1,
                d3.max(points, d => d.x) + 0.1
            ])
            .range([0, this.innerWidth])
            .nice();

        const y = d3.scaleLinear()
            .domain([
                d3.min(points, d => d.y) - 0.1,
                d3.max(points, d => d.y) + 0.1
            ])
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
            .attr("id", d => d.label)
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
            .style("font-family", "sans-serif")
            .style("fill", "#000");

        // X & Y axes
        this.chartGroup.append("g")
            .attr("transform", `translate(0, ${this.innerHeight})`)
            .call(d3.axisBottom(x))
            .style("font-size", `${this.legendSize}px`);

        this.chartGroup.append("g")
            .call(d3.axisLeft(y))
            .style("font-size", `${this.legendSize}px`);

            /*
        //top axis
        this.chartGroup.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", this.innerWidth)
            .attr("y2", 0)
            .attr("stroke", "#000")
            .attr("stroke-width", 1);


        // Right axis
        this.chartGroup.append("line")
            .attr("x1", this.innerWidth)
            .attr("y1", 0)
            .attr("x2", this.innerWidth)
            .attr("y2", this.innerHeight)
            .attr("stroke", "#000")
            .attr("stroke-width", 1);
            */

    }

    draw3D() {
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(
            45,
            this.width / this.height,
            0.1,
            1000
        );
        camera.position.set(1, 1, 3);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setSize(this.width, this.height);
        this.element.innerHTML = "";
        this.element.appendChild(renderer.domElement);


        // camera control - rotating
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.1; // how fast is camera rotating

        // camera zoom
        controls.enableZoom = true;          // povolit zoom
        controls.minDistance = 1;            // minimální vzdálenost kamery od targetu
        controls.maxDistance = 10;

        // lights
        scene.add(new THREE.AmbientLight(0xffffff, 1));
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);

        // axes and grid
        const axes = this.createAxes(1.2);
        scene.add(axes);
        const grid = new THREE.GridHelper(2, 10, 0x999999, 0xdddddd);
        scene.add(grid);

        // scaling
        const x = d3.scaleLinear().domain(d3.extent(this.mds, d => d[0])).range([-1, 1]);
        const y = d3.scaleLinear().domain(d3.extent(this.mds, d => d[1])).range([-1, 1]);
        const z = d3.scaleLinear().domain(d3.extent(this.mds, d => d[2])).range([-1, 1]);

        // axis labels
        this.createAxisLabels(x, y, z, scene, this.mds);

        this.points3D = []; // points

        this.mds.forEach((d, i) => {
            // point
            const geometry = new THREE.SphereGeometry(0.03, 16, 16); // radius, width, height
            const material = new THREE.MeshStandardMaterial({ color: "#41b8d5" });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x(d[0]), y(d[1]), z(d[2]));
            mesh.userData = { label: i + 1 };
            scene.add(mesh);
            this.points3D.push(mesh);

            // label as sprite (faces camera)

            // first create canvas
            const canvas = document.createElement('canvas');
            const size = 100;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.font = "50px sans-serif";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${i + 1}`, size / 2, size / 2);

            // now create sprite
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(0.1, 0.1, 1);
            sprite.position.copy(mesh.position);
            sprite.position.y += 0.06;
            scene.add(sprite);
        });

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // uložíme reference pro případný cleanup
        this._three = { scene, camera, renderer, controls };
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

    createAxes(size = 1) {
        const group = new THREE.Group();

        const materialX = new THREE.LineBasicMaterial({ color: 0x2d8095 });
        const materialY = new THREE.LineBasicMaterial({ color: 0x1a4955 });
        const materialZ = new THREE.LineBasicMaterial({ color: 0x0d242a });

        const pointsX = [
            new THREE.Vector3(-size, 0, 0),
            new THREE.Vector3(size, 0, 0)
        ];
        const pointsY = [
            new THREE.Vector3(0, -size, 0),
            new THREE.Vector3(0, size, 0)
        ];
        const pointsZ = [
            new THREE.Vector3(0, 0, -size),
            new THREE.Vector3(0, 0, size)
        ];

        group.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pointsX),
            materialX
        ));
        group.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pointsY),
            materialY
        ));
        group.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pointsZ),
            materialZ
        ));

        return group;
    }

    createAxisLabels(xScale, yScale, zScale, scene, mds) {
        const [minX, maxX] = d3.extent(mds, d => d[0]);
        const [minY, maxY] = d3.extent(mds, d => d[1]);
        const [minZ, maxZ] = d3.extent(mds, d => d[2]);

        const nTicks = 10;
        const xTicksData = d3.range(minX, maxX + 1e-6, (maxX - minX) / (nTicks - 1));
        const yTicksData = d3.range(minY, maxY + 1e-6, (maxY - minY) / (nTicks - 1));
        const zTicksData = d3.range(minZ, maxZ + 1e-6, (maxZ - minZ) / (nTicks - 1));

        const canvasSize = 128;
        const fontSize = 50;

        const createSprite = (text) => {
            const canvas = document.createElement('canvas');
            canvas.width = canvasSize;
            canvas.height = canvasSize;
            const ctx = canvas.getContext('2d');
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = '#4c4c4c';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, canvasSize / 2, canvasSize / 2);
            const texture = new THREE.CanvasTexture(canvas);
            return new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
        };

        // X axis
        xTicksData.forEach(val => {
            const sprite = createSprite(val.toFixed(2));
            sprite.scale.set(0.15, 0.15, 1);
            sprite.position.set(xScale(val), -0.06, 0);
            scene.add(sprite);
        });

        // Y axis
        yTicksData.forEach(val => {
            const sprite = createSprite(val.toFixed(2));
            sprite.scale.set(0.15, 0.15, 1);
            sprite.position.set(-0.06, yScale(val), 0);
            scene.add(sprite);
        });

        // Z axis
        zTicksData.forEach(val => {
            const sprite = createSprite(val.toFixed(2));
            sprite.scale.set(0.15, 0.15, 1);
            sprite.position.set(0, -0.06, zScale(val));
            scene.add(sprite);
        });
    }

    markFactor(factorIdx, mark) {
        if (mark) {
            // unmark active factor
            if (this.activeFactorIdx) {
                this.markFactorWithColor(false);
            }
            this.activeFactorIdx = factorIdx;
            this.markFactorWithColor(mark);
        } else {
            this.markFactorWithColor(mark);
            this.activeFactorIdx = null;
        }
    }


    markFactorWithColor(fill) {
        const defaultColor = this.factorColor;
        const activeColor = this.markColor;
        const activeId = this.activeFactorIdx;

        if (this.mds.length > 0 && this.mds[0].length === 3 && this.mdsViewTarget === "3D") {
            // 3D
            this.points3D.forEach((mesh, i) => {
                if (i === activeId) {
                    mesh.material.color.set(fill ? activeColor : defaultColor);
                } else {
                    mesh.material.color.set(defaultColor);
                }
            });
        } else {
            // 2D
            this.chartGroup.selectAll("circle.point")
                .attr("fill", d =>
                    d.label === activeId
                        ? (fill ? activeColor : defaultColor)
                        : defaultColor
                );
        }
    }

}