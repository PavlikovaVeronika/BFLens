"use client";

import Row from "@/components/Row";

import React from "react";
import { useFile } from "../../../app/context/filecontext";
import Description from "@/components/Description.js";
import ChartContainer from "@/components/ChartContainer";

export default function General() {
    const { selectedFile } = useFile();


    return (
        <div className="flex flex-col py-5">
            <div className="flex flex-col mb-6">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Data visualization
                    </h2>

                    <Description
                        text={
                            "The next part of the page displays the dataset in the form of a matrix. Next to the matrix is ​​a list of all factors. To explore the factors in the data in more detail, use the checkbox next to the factor."
                        }
                    />
                </div>

                <div className="flex gap-6">
                    <div className="flex-1">
                        <ChartContainer
                            renderChart={(charts, ref, size) => {
                                if (!selectedFile) return;
                                charts.makeDataMatrix(ref, { size: size });
                            }}
                        />
                    </div>

                    <div className="flex-1">
                        <ChartContainer
                            renderChart={(charts, ref, size) => {
                                if (!selectedFile) return;
                                charts.makeFactorsList(ref, { size: size });
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
