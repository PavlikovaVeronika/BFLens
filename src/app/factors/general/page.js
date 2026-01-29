"use client";

import { React, useRef, useState, useEffect } from "react";
import { useFile } from "../../../app/context/filecontext";
import Description from "@/components/Description.js";
import ChartContainer from "@/components/ChartContainer";
import FileInfo from "@/components/FileInfo";

export default function General() {
    const { selectedFile } = useFile();
    const dataMatrixRef = useRef(null);

    const [fileData, setFileData] = useState(null);

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
            <div className="flex flex-col mb-6">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        File information
                    </h2>

                    <Description
                        text={
                            "The following section displays basic information about the file that contains the factorization results. If the file also contains a list of classes belonging to the objects, their list is displayed. A closer examination of the factors is possible in the next section of the screen."
                        }
                    />
                </div>
                <div>
                    <FileInfo />
                </div>
            </div>
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
                            type="dataMatrix"
                            renderChart={async (charts, ref, size) => {
                                if (!selectedFile) return;

                                const matrix = await charts.makeDataMatrix(ref, { size });
                                dataMatrixRef.current = matrix;
                            }}
                        />
                    </div>

                    <div className="flex-1">
                        <ChartContainer
                            type="factorsList"
                            renderChart={(charts, ref, size) => {
                                if (!selectedFile) return;
                                charts.makeFactorsList(ref, {
                                    size,
                                    markFactorCallback: (factorIndex) => {
                                        if (factorIndex != null) {
                                            dataMatrixRef.current?.markFactor(factorIndex, true);
                                        } else {
                                            dataMatrixRef.current?.markFactor(factorIndex, false);
                                        }

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
                        Size of factors
                    </h2>

                    <Description
                        text={
                            "The following scatter plot shows the size of the factors in terms of the number of objects and attributes that belong to a given factor. The x-axis shows the number of objects, the y-axis shows the number of attributes. Hover over the individual points to see more information."
                        }
                    />
                </div>
                <ChartContainer
                    type="factorsScatterPlot"
                    renderChart={(charts, ref, size) => {
                        if (!selectedFile) return;
                        charts.makeFactorsScatterPlot(ref, { size: size });
                    }}
                />
            </div>

            {fileData?.coverage != null && (
                <div className="flex flex-col mb-6">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Coverage of factors
                        </h2>

                        <Description
                            text={
                                "The following scatter plot shows the factor coverage curve of the data. This means how many 1's in the original data are already covered by the factors."
                            }
                        />
                    </div>
                    <ChartContainer
                        type="factorsCoveragePlot"
                        renderChart={(charts, ref, size) => {
                            if (!selectedFile) return;
                            charts.makeFactorsCoveragePlot(ref, { size: size });
                        }}
                    />
                </div>
            )}
        </div>
    );
}
