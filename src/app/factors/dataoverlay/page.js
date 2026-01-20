"use client";

import React, { useState, useEffect, useRef } from "react";
import { useFile } from "../../../app/context/filecontext";
import Description from "@/components/Description.js";
import ChartContainer from "@/components/ChartContainer";

export default function DataOverlay() {
    const { selectedFile } = useFile();
    const [hasClass, setHasClass] = useState(false);
    const [activeFactorIndex, setActiveFactorIndex] = useState(null);
    const [activeFactorIndex2, setActiveFactorIndex2] = useState(null);

    // refs to store the FactorsList instances
    const factorsListRef1 = useRef(null);
    const factorsListRef2 = useRef(null);

    useEffect(() => {
        if (!selectedFile) return;

        fetch(`/data/${selectedFile}`)
            .then(res => res.json())
            .then(data => {
                setHasClass(!!data.class);
            })
            .catch(err => {
                console.error("Error loading file:", err);
                setHasClass(false);
            });
    }, [selectedFile]);

    return (
        <div className="flex flex-col py-5">
            {/* Factor vs Attributes */}
            <div className="flex flex-col mb-6">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Overlay between factor and attributes
                    </h2>
                    <Description
                        text={
                            "In this bar chart, you can examine the overlap between the factor and the original data in more detail. Specifically, the overlap between attributes is shown. The X-axis shows the individual attributes represented in the chart. The Y-axis then shows the number of objects having this attribute. The individual columns contain both the total number of objects having given attribute and the number of objects with a given attribute belonging to the relevant factor. Use the list on the right side of the screen to select a factor."
                        }
                    />
                </div>

                <div className="flex gap-6">
                    <div className="flex-1 min-w-0">
                        {activeFactorIndex2 === null ? (
                            <div className="flex items-center justify-center h-full text-gray-500 text-center px-6">
                                First select a factor from the list on the right side
                            </div>
                        ) : (
                            <ChartContainer
                                type="factorAttribute"
                                renderChart={(charts, ref, size, options = {}) => {
                                    if (!selectedFile) return;
                                    charts.makeFactorAttributeStackedBarchart(ref, activeFactorIndex2, {
                                        size: size,
                                        selectAll: options.selectAll || false
                                    });
                                }}
                            />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <ChartContainer
                            type="factorsList"
                            renderChart={(charts, ref, size) => {
                                if (!selectedFile) return;

                                if (!factorsListRef1.current) {
                                    factorsListRef1.current = charts.makeFactorsList(ref, {
                                        size,
                                        markFactorCallback: setActiveFactorIndex2
                                    });
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Factor vs Classes */}
            {hasClass && (
                <div className="flex flex-col mb-6">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Overlay between factor and classes
                        </h2>
                        <Description
                            text={
                                "In this bar chart, you can examine the overlap between the factor and the original data in more detail. Specifically, the overlap between classes is shown. The X-axis shows the individual classes represented in the chart. The Y-axis then shows the number of objects in each class. The individual columns contain both the total number of objects belonging to a given class and the number of objects with a given class belonging to the relevant factor. Use the list on the right side of the screen to select a factor."
                            }
                        />
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-1 min-w-0">
                            {activeFactorIndex === null ? (
                                <div className="flex items-center justify-center h-full text-gray-500 text-center px-6">
                                    First select a factor from the list on the right side
                                </div>
                            ) : (
                                <ChartContainer
                                    type="factorClass"
                                    renderChart={(charts, ref, size, options = {}) => {
                                        if (!selectedFile) return;
                                        charts.makeFactorClassStackedBarchart(ref, activeFactorIndex, {
                                            size: size,
                                            selectAll: options.selectAll || false
                                        });
                                    }}
                                />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <ChartContainer
                                type="factorsList"
                                renderChart={(charts, ref, size) => {
                                    if (!selectedFile) return;

                                    if (!factorsListRef2.current) {
                                        factorsListRef2.current = charts.makeFactorsList(ref, {
                                            size,
                                            markFactorCallback: setActiveFactorIndex
                                        });
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}