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
    const [loading, setLoading] = useState(false);
    const [charts, setCharts] = useState(null);
    const [selectAll, setSelectAll] = useState(true);


    useEffect(() => {
        if (!selectedFile) return;

        const c = new Charts(`/data/${selectedFile}`);
        setCharts(c);
    }, [selectedFile]);

    useEffect(() => {
        if (!charts || !chartRef.current || !renderChart) return;

        requestAnimationFrame(() => {
            renderChart(charts, chartRef.current, height, {
                similarityTarget,
                calcObj,
                selectAll
            });
        });
    }, [charts, height, similarityTarget, calcObj, selectAll, renderChart]);

    return (
        <div className="flex flex-col mb-6 rounded-lg bg-gray-100 shadow-md">
            {/* chart */}
            <div
                ref={chartRef}
                className="overflow-auto w-full"
            />

            {/* panel */}
            <div className="flex items-center justify-end gap-5 border-t border-gray-300 bg-gray-50 p-3">

                {type === "factorssimilarity" && (
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

                {(type === "factorclass" || type === "factorattribute") && (
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
                <button className="text-gray-600 hover:text-gray-800 text-xl">
                    <i className="ri-search-line"></i>
                </button>
                <button className="text-gray-600 hover:text-gray-800 text-xl">
                    <i className="ri-download-line"></i>
                </button>
            </div>

        </div>
    );
}