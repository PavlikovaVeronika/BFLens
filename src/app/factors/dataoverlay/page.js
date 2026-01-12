"use client";

import Row from "@/components/Row";

import React, { useState } from "react";
import { useFile } from "../../../app/context/filecontext";
import Description from "@/components/Description.js";
import ChartContainer from "@/components/ChartContainer";

export default function DataOverlay() {
    const { selectedFile } = useFile();
    const [activeFactorIndex, setActiveFactorIndex] = useState(null);
    const [activeFactorIndex2, setActiveFactorIndex2] = useState(null);



    return (
        <div className="flex flex-col py-5">
                        <div className="flex flex-col mb-6">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Overlay between factor and attributes
                    </h2>

                    <Description
                        text={
                            "In this column chart, you can examine the overlap between the factor and the original data in more detail. Specifically, the overlap between attributes is shown. The X-axis shows the individual attributes represented in the chart. The Y-axis then shows the number of objects having this attribute. The individual columns contain both the total number of objects having given attribute and the number of objects with a given attribute belonging to the relevant factor. Use the list on the right side of the screen to select a factor."
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
                                type="factorattribute"
                                renderChart={(charts, ref, size, options = {}) => {
                                    if (!selectedFile) return;

                                    const { selectAll = false, similarityTarget = null, calcObj = false } = options;

                                    charts.makeFactorAttributeStackedBarchart(
                                        ref,
                                        activeFactorIndex2,
                                        {
                                            height: size,
                                            selectAll: selectAll,
                                        }
                                    );
                                }}
                            />
                        )}
                    </div>


                    <div className="flex-1 min-w-0">
                        <ChartContainer
                            renderChart={(charts, ref, size) => {
                                if (!selectedFile) return;

                                console.log(size);

                                charts.makeFactorsList(ref, {
                                    size: size,
                                    markFactorCallback: (factorIndex) => {
                                        setActiveFactorIndex2(factorIndex);
                                    },
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col mb-6">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Overlay between factor and classes
                    </h2>

                    <Description
                        text={
                            "In this column chart, you can examine the overlap between the factor and the original data in more detail. Specifically, the overlap between classes is shown. The X-axis shows the individual classes represented in the chart. The Y-axis then shows the number of objects in each class. The individual columns contain both the total number of objects belonging to a given class and the number of objects with a given class belonging to the relevant factor. Use the list on the right side of the screen to select a factor."
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
                                type="factorclass"
                                renderChart={(charts, ref, size, options = {}) => {
                                    if (!selectedFile) return;

                                    const { selectAll = false, similarityTarget = null, calcObj = false } = options;

                                    charts.makeFactorClassStackedBarchart(
                                        ref,
                                        activeFactorIndex,
                                        {
                                            height: size,
                                            selectAll: selectAll,
                                        }
                                    );
                                }}
                            />
                        )}
                    </div>


                    <div className="flex-1 min-w-0">
                        <ChartContainer
                            renderChart={(charts, ref, size) => {
                                if (!selectedFile) return;

                                charts.makeFactorsList(ref, {
                                    size: size,
                                    markFactorCallback: (factorIndex) => {
                                        console.log(factorIndex);
                                        setActiveFactorIndex(factorIndex);
                                    },
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}