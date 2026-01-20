import { useEffect, useState } from "react";
import { useFile } from "../app/context/filecontext";

export default function FileInfo() {
    const { selectedFile } = useFile();

    const [fileData, setFileData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!selectedFile) {
            setFileData(null);
            return;
        }

        setLoading(true);
        setError(null);

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
                setError(err.message);
                setFileData(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [selectedFile]);

    const objects = fileData?.objects || [];
    const objectsCount = objects.length;

    const attributes = fileData?.attributes || [];
    const attributesCount = attributes.length;

    const factors = fileData?.factors || [];
    const factorsCount = factors.length;

    const classes = fileData?.classDescription || [];
    const classesCount = classes.length;


    return (
        <div>
            <div className="flex items-center gap-2 text-gray-600 p-5 rounded-lg border border-gray-200">
                {loading &&
                    <div
                        className="flex items-center justify-center bg-white w-full"
                        style={{ height: `300px` }}
                    >
                        <div className="w-12 h-12 border-4 border-gray-300 border-t-[#016bab] rounded-full animate-spin"></div>
                    </div>
                }

                {error && (
                    <span className="text-red-500">
                        Error: {error}
                    </span>
                )}

                {!loading && !error && fileData && (
                    <div className="flex flex-col gap-2">
                        <div>
                            <span className="font-semibold text-gray-800">File name:</span>{" "}
                            {selectedFile}
                        </div>

                        {fileData.description && (
                            <div>
                                <span className="font-semibold text-gray-800">
                                    Description:
                                </span>{" "}
                                {fileData.description}
                            </div>
                        )}

                        <div>
                            <span className="font-semibold text-gray-800">No. objects:</span>{" "}
                            {objectsCount}
                        </div>

                        <div>
                            <span className="font-semibold text-gray-800">No. attributes:</span>{" "}
                            {attributesCount}
                        </div>

                        <div>
                            <span className="font-semibold text-gray-800">No. factors:</span>{" "}
                            {factorsCount}
                        </div>

                        <div>
                            <span className="font-semibold text-gray-800">No. classes:</span>{" "}
                            {classesCount}
                        </div>

                        <div>
                            {classesCount > 0 ? (
                                <>
                                    <span className="font-semibold text-gray-800">Classes:</span>{" "}
                                    {classes.join(", ")}
                                </>

                            ) : (
                                <>No classes defined in this file.</>
                            )}
                        </div>

                    </div>
                )}

                {!loading && !error && !fileData && (
                    <span className="italic text-gray-400">
                        No file selected
                    </span>
                )}
            </div>
        </div >
    );
}