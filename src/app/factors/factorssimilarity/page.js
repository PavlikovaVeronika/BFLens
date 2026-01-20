"use client";

import React from "react";
import { useFile } from "../../../app/context/filecontext";
import Description from "@/components/Description.js";
import ChartContainer from "@/components/ChartContainer";

export default function FactorsSimilarityHeatmap() {
    const { selectedFile } = useFile();

    return (
        <div className="flex flex-col py-5">
            <div className="flex flex-col mb-6">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Similarity of factors
                    </h2>

                    <Description
                        text={
                            "This heat map shows the similarities between individual factors. To view specific values, hover over individual cells of the heat map - a tooltip with more detailed information will appear. In the control panel, you can also change the similarity metric and the comparison target (objects vs. attributes)."
                        }
                    />
                </div>

                <ChartContainer
                    type="factorsSimilarity"
                    renderChart={(charts, ref, size, options = {}) => {
                        if (!selectedFile) return;
                        const { selectAll = false, similarityTarget = null, calcObj = false } = options;
                        charts.makeFactorsSimilarityHeatmap(ref, { size: size, similarity: similarityTarget, calcObj: calcObj });
                    }}
                />
            </div>
        </div>
    );
}
