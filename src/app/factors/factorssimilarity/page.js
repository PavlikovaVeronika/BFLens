"use client";

import { React, useState, useEffect, useRef } from "react";
import { useFile } from "../../../app/context/filecontext";
import Description from "@/components/Description.js";
import ChartContainer from "@/components/ChartContainer";

export default function FactorsSimilarityHeatmap() {
    const { selectedFile } = useFile();
    const mdsRef = useRef(null);

    const [fileData, setFileData] = useState(null);
    const activeMdsFactorIdxRef = useRef(null);

    useEffect(() => {
        if (!selectedFile) {
            setFileData(null);
            return;
        }

        fetch(`/data/${selectedFile}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("File not found");
                }
                return res.json();
            })
            .then((json) => {
                setFileData(json);
            })
            .catch((err) => {
                setFileData(null);
            });
    }, [selectedFile]);

    return (
        <div className="flex flex-col py-5">
            {fileData?.mds != null && (
                <div className="flex flex-col mb-6">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Multidimensional scaling
                        </h2>

                        <Description
                            text={
                                "The following scatter plot shows the similarity of factors on a graph using the Multidimensional scaling, also known as MDS. At the bottom of the panel, you can select the similarity for which you want to view the MDS."
                            }
                        />
                    </div>

                    <div className="flex gap-6">
                        <div className="flex-1 min-w-0">
                            <ChartContainer
                                type="factorsMDS"
                                renderChart={async (charts, ref, size, options = {}) => {
                                    if (!selectedFile) return;
                                    const { selectAll = false, similarityTarget = null, mdsTarget = null, mdsViewTarget = null } = options;
                                    
                                    const mds = await charts.makeFactorsMDS(ref, { size: size, mdsTarget: mdsTarget, mdsViewTarget: mdsViewTarget, activeFactorIdx: activeMdsFactorIdxRef.current });
                                    mdsRef.current = mds;
                                }}
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <ChartContainer
                                type="factorsList"
                                renderChart={(charts, ref, size) => {
                                    if (!selectedFile) return;
                                    charts.makeFactorsList(ref, {
                                        size,
                                        markFactorCallback: (factorIndex) => {
                                            if (factorIndex != null) {
                                                mdsRef.current?.markFactor(factorIndex, true);
                                                activeMdsFactorIdxRef.current = factorIndex;
                                            } else {
                                                mdsRef.current?.markFactor(factorIndex, false);
                                                activeMdsFactorIdxRef.current = null;
                                            }

                                        },
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col mb-6">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Similarity of factors
                    </h2>

                    <Description
                        text={
                            "This heat map shows the similarities between individual factors. To view specific values, hover over individual cells of the heat map - a tooltip with more detailed information will appear. In the control panel, you can also change the similarity metric."
                        }
                    />
                </div>

                <ChartContainer
                    type="factorsSimilarity"
                    renderChart={(charts, ref, size, options = {}) => {
                        if (!selectedFile) return;
                        const { selectAll = false, similarityTarget = null } = options;
                        charts.makeFactorsSimilarityHeatmap(ref, { size: size, similarity: similarityTarget });
                    }}
                />
            </div>
        </div>
    );
}
