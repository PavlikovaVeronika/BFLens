"use client";

import { useFile } from "../app/context/filecontext";
import React, { useEffect, useRef, useState } from "react";
import Charts from "../charts/Charts.js";

export default function ChartContainer({ type, renderChart }) {
    const { selectedFile } = useFile();
    const chartRef = useRef(null);
    const [height, setHeight] = useState(500);
    const [similarityTarget, setSimilarityTarget] = useState("jaccard");
    const [calcObj, setCalcObj] = useState(false);
    const [inputHeight, setInputHeight] = useState(height);
    const [loading, setLoading] = useState(true);
    const [charts, setCharts] = useState(null);
    const [selectAll, setSelectAll] = useState(true);


    useEffect(() => {
        if (!selectedFile) return;

        const c = new Charts(`/data/${selectedFile}`);
        setCharts(c);
    }, [selectedFile]);

    useEffect(() => {
        if (!charts || !chartRef.current || !renderChart) return;
        setLoading(true);

        requestAnimationFrame(() => {
            renderChart(charts, chartRef.current, height, {
                similarityTarget,
                calcObj,
                selectAll
            });
            setLoading(false);
        });

    }, [charts, height, similarityTarget, calcObj, selectAll, renderChart]);

    // open chart in new window
    const openChartInNewWindow = () => {
        if (!chartRef.current) return;

        const svg = chartRef.current.querySelector("svg");
        if (!svg) return;

        const clonedSVG = svg.cloneNode(true);

        const win = window.open("", "_blank");
        if (!win) return;

        const doc = win.document;
        doc.title = "Chart preview";

        doc.body.appendChild(clonedSVG);
    };

    const downloadChartSVG = () => {
        const filename = type ? `${selectedFile}_${type}.svg` : `${selectedFile}_chart.svg`;
        if (!chartRef.current) return;

        const svg = chartRef.current.querySelector("svg");
        if (!svg) return;

        const clonedSVG = svg.cloneNode(true);

        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(clonedSVG);

        svgString = `<?xml version="1.0" standalone="no"?>\n` + svgString;

        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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

            {/* panel */}
            <div className="flex items-center justify-end gap-5 border-t border-gray-300 bg-gray-50 p-3">

                {type === "factorsSimilarity" && (
                    <>
                        <div className="flex items-center gap-1">
                            <label className="text-gray-700 font-medium">Similarity:</label>
                            <select
                                value={similarityTarget}
                                onChange={(e) => setSimilarityTarget(e.target.value)}
                                className="border rounded px-2 py-1"
                            >
                                <option value="jaccard">jaccard</option>
                                <option value="smc">smc</option>
                            </select>
                        </div>



                        <div className="flex items-center gap-1">
                            <label className="text-gray-700 font-medium">Target:</label>
                            <select
                                value={calcObj}
                                onChange={e => setCalcObj(e.target.value === "true")}
                                className="border rounded px-2 py-1"
                            >
                                <option value={true}>objects</option>
                                <option value={false}>attributes</option>
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
                        <label
                            htmlFor="selectAllOptions"
                            className="cursor-pointer"
                        >
                            Select all options
                        </label>
                    </div>
                )}


                {/* Height control */}
                <div className="flex items-center gap-1">
                    <label className="text-gray-700 font-medium">Height:</label>
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

                {/* actions */}
                {(type !== "dataMatrix" && type != "factorsList") && (
                    <button className="text-gray-600 hover:text-gray-800 text-xl cursor-pointer" onClick={openChartInNewWindow}>
                        <i className="ri-arrow-right-up-box-line"></i>
                    </button>
                )}
                <button className="text-gray-600 hover:text-gray-800 text-xl cursor-pointer" onClick={downloadChartSVG}>
                    <i className="ri-download-line"></i>
                </button>
            </div>

        </div>
    );
}