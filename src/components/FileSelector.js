"use client";

import { useEffect, useRef, useState } from "react";
import { useFile } from "../app/context/filecontext";

export default function FileSelector({ files }) {
    const { selectedFile, setSelectedFile } = useFile();
    const [filter, setFilter] = useState(selectedFile || "");
    const [open, setOpen] = useState(false);

    const wrapperRef = useRef(null);

    const visibleFiles = files
        .filter((f) => f.toLowerCase().includes(filter.toLowerCase()))
        .slice(0, 5);

    useEffect(() => {
        if (!selectedFile) return;
        setFilter(selectedFile || "")

        function handleClickOutside(event) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedFile]);

    return (
        <>
            <div ref={wrapperRef} className="relative w-full max-w-md mb-10">
                <div
                    className="flex items-center gap-2 rounded-full bg-transparent border border-zinc-50 text-zinc-50 px-5 py-3 cursor-pointer"
                    onClick={() => setOpen(true)}>
                    <input
                        name="fileSelect"
                        className="w-full placeholder-zinc-200 outline-none"
                        placeholder="Select data file…"
                        value={filter}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFilter(val);

                            if (!files.includes(val)) {
                                setSelectedFile(null);
                            } else {
                                setSelectedFile(val);
                            }

                            setOpen(true);
                        }}
                    />

                    <i className="ri-arrow-down-s-fill text-xl"></i>
                </div>

                {/* dropdown */}
                {open && visibleFiles.length > 0 && (
                    <div className="absolute mt-2 w-full max-h-40 overflow-y-auto rounded-xl bg-white shadow-lg">
                        {visibleFiles.map((file) => (
                            <button
                                key={file}
                                className="w-full px-4 py-2 text-left hover:bg-zinc-100"
                                onClick={() => {
                                    setSelectedFile(file);
                                    setFilter(file);
                                    setOpen(false);
                                }}
                            >
                                {file}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* button */}
            <a
                href="/factors/general"
                className={`${!selectedFile ? "invisible" : "visible"} flex h-12 items-center justify-center gap-2 rounded-full px-5 text-zinc-50 transition-colors hover:bg-white hover:text-[#016bab] border border-zinc-50`}
            >
                Explore factors in data
            </a>

        </>
    );
}