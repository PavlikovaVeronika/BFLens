"use client";

import { useFile } from "../app/context/filecontext";
import React, { useEffect, useRef, useState } from "react";
import Charts from "../charts/Charts.js";

export default function ChartContainer({ type, renderChart }) {
    const { selectedFile } = useFile();

    const chartRef = useRef(null);
    const [height, setHeight] = useState(500);
    const [inputHeight, setInputHeight] = useState(height);
    const [loading, setLoading] = useState(true);
    const [charts, setCharts] = useState(null);
    const [selectAll, setSelectAll] = useState(true);

    const [mdsTarget, setMdsTarget] = useState("");
    const [mdsViewTarget, setMdsViewTarget] = useState("2D");
    const [mdsOptions, setMdsOptions] = useState([]);

    const [similarityTarget, setSimilarityTarget] = useState("");

    const [panelOpen, setPanelOpen] = useState(false);


    useEffect(() => {
        if (!selectedFile) return;

        const c = new Charts(`/data/${selectedFile}`);
        setCharts(c);

        fetch(`/data/${selectedFile}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("File not found");
                }
                return res.json();
            })
            .then((json) => {
                setMdsOptions(json?.similarities || [])
            })
            .finally(() => {
                setLoading(false);
            });
    }, [selectedFile]);


    useEffect(() => {
        if (mdsOptions && mdsOptions.length > 0) {
            setSimilarityTarget(mdsOptions[0]);
            setMdsTarget(mdsOptions[0]);
        }
    }, [mdsOptions]);


    useEffect(() => {
        if (!charts || !chartRef.current || !renderChart) return;
        setLoading(true);

        requestAnimationFrame(() => {
            renderChart(charts, chartRef.current, height, {
                similarityTarget,
                mdsTarget,
                mdsViewTarget,
                selectAll
            });
            setLoading(false);
        });

    }, [charts, height, similarityTarget, mdsTarget, mdsViewTarget, selectAll, renderChart, mdsOptions]);

    const openChartInNewWindow = () => {
        if (!chartRef.current) return;

        // 2D SVG nebo 3D canvas
        const svg = chartRef.current.querySelector("svg");
        const canvas = chartRef.current.querySelector("canvas");

        if (svg) {
            // 2D - klonujeme SVG
            const clonedSVG = svg.cloneNode(true);
            const win = window.open("", "_blank");
            if (!win) return;
            win.document.title = "Chart preview";
            win.document.body.appendChild(clonedSVG);
        } else if (canvas) {
            // 3D - WebGL canvas -> PNG
            // Zajistíme, že canvas je finálně vyrenderován
            const renderer = canvas._threeRenderer || null; // pokud uložíš reference
            const scene = canvas._threeScene || null;
            const camera = canvas._threeCamera || null;

            if (renderer && scene && camera) {
                renderer.render(scene, camera); // final render
            }

            // snapshot
            const url = canvas.toDataURL("image/png");
            const img = new Image();
            img.onload = () => {
                const win = window.open("", "_blank");
                if (!win) return;
                win.document.title = "Chart preview";
                win.document.body.style.margin = "0";
                win.document.body.appendChild(img);
            };
            img.src = url;
        }
    };

    const downloadChartSVG = () => {
        if (!chartRef.current) return;

        const svg = chartRef.current.querySelector("svg");
        const canvas = chartRef.current.querySelector("canvas");

        // ===== 2D SVG =====
        if (svg) {
            const filename = type
                ? `${selectedFile}_${type}.svg`
                : `${selectedFile}_chart.svg`;

            const clonedSVG = svg.cloneNode(true);

            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(clonedSVG);
            svgString = `<?xml version="1.0" standalone="no"?>\n` + svgString;

            const blob = new Blob([svgString], {
                type: "image/svg+xml;charset=utf-8"
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return;
        }

        // ===== 3D WebGL → PNG =====
        if (canvas) {
            const filename = type
                ? `${selectedFile}_${type}.png`
                : `${selectedFile}_chart.png`;

            // vytvoříme nový canvas
            const exportCanvas = document.createElement("canvas");
            exportCanvas.width = canvas.width;
            exportCanvas.height = canvas.height;

            const ctx = exportCanvas.getContext("2d");

            // bílé pozadí
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

            // překreslíme původní WebGL canvas
            ctx.drawImage(canvas, 0, 0);

            const url = exportCanvas.toDataURL("image/png");

            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    return (
        <div className="relative flex flex-col mb-6 rounded-lg bg-gray-100 shadow-md">
            {loading && (
                <div
                    className="flex items-center justify-center bg-white"
                    style={{ height: `${inputHeight}px` }}
                >
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-[#016bab] rounded-full animate-spin"></div>
                </div>
            )}

            {/* chart */}
            <div
                ref={chartRef}
                className="overflow-auto w-full scroll-container"
            />

            {(type !== "dataMatrix" && type !== "factorsList" && type !== "factorsSimilarity") && (
                <div className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl group">
                    <i className="ri-information-line"></i>
                    {/* Tooltip */}
                    <span className="absolute top-0 right-full mr-2 w-max px-2 py-1 text-sm text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        Use your mouse or touch gestures to zoom in and out.
                    </span>
                </div>
            )}

            {/* toggle button pro panel */}
            <div className="flex justify-end border-t border-gray-300 bg-gray-50 p-2 cursor-pointer" onClick={() => setPanelOpen(!panelOpen)}>
                <span className="text-gray-600 flex items-center gap-1">
                    More actions <i className={`ri-arrow-${panelOpen ? "up" : "down"}-s-line text-xl`}></i>
                </span>
            </div>

            {/* panel – accordeon */}
            {panelOpen && (

                <>
                    <div className="flex flex-wrap items-center justify-end gap-5 border-t border-gray-300 bg-gray-50 p-3">

                        {type === "factorsSimilarity" && (
                            <div className="flex items-center gap-1">
                                <label className="text-gray-700 font-medium">Similarity:</label>
                                <select
                                    value={similarityTarget}
                                    onChange={(e) => setSimilarityTarget(e.target.value)}
                                    className="border rounded px-2 py-1"
                                >
                                    {mdsOptions?.map(opt => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {type === "factorsMDS" && (
                            <>
                                <div className="flex items-center gap-1">
                                    <label className="text-gray-700 font-medium">Similarity:</label>
                                    <select
                                        value={mdsTarget}
                                        onChange={(e) => setMdsTarget(e.target.value)}
                                        className="border rounded px-2 py-1"
                                    >
                                        {mdsOptions?.map(opt => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-1">
                                    <label className="text-gray-700 font-medium">View:</label>
                                    <select
                                        value={mdsViewTarget}
                                        onChange={(e) => setMdsViewTarget(e.target.value)}
                                        className="border rounded px-2 py-1"
                                    >
                                        <option key="2D" value="2D">2D</option>
                                        <option key="3D" value="3D">3D</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {(type === "factorClass" || type === "factorAttribute") && (
                            <div className="flex items-center gap-1">
                                <input
                                    type="checkbox"
                                    id="selectAllOptions"
                                    checked={selectAll}
                                    onChange={(e) => setSelectAll(e.target.checked)}
                                />
                                <label htmlFor="selectAllOptions" className="cursor-pointer">Select all options</label>
                            </div>
                        )}

                        {/* Height control */}
                        <div className="flex items-center gap-1">
                            <label className="text-gray-700">Height:</label>
                            <div className="flex items-stretch gap-1">
                                <input
                                    type="number"
                                    value={inputHeight}
                                    onChange={(e) => setInputHeight(Number(e.target.value))}
                                    className="border rounded px-2 py-1 w-24"
                                />
                                <button
                                    onClick={() => setHeight(inputHeight)}
                                    className="bg-[#016bab] text-white px-3 py-1 rounded hover:bg-[#6c9dba] box-border uppercase"
                                >
                                    set
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* actions */}
                    {(type !== "dataMatrix" && type !== "factorsList") && (
                        <div className="flex flex-wrap items-center justify-end gap-5 border-t border-gray-300 bg-gray-50 p-3">
                            <button className="text-gray-600 hover:text-gray-800 text-xl cursor-pointer" onClick={openChartInNewWindow}>
                                <i className="ri-arrow-right-up-box-line"></i>
                            </button>

                            <button className="text-gray-600 hover:text-gray-800 text-xl cursor-pointer" onClick={downloadChartSVG}>
                                <i className="ri-arrow-down-box-line"></i>
                            </button>
                        </div>
                    )}

                </>
            )}

        </div>
    );
}