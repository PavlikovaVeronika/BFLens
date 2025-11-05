"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Row({ title, children, defaultOpen = false, className }) {
  const [open, setOpen] = useState(defaultOpen);
  const [height, setHeight] = useState(0);
  const innerRef = useRef(null);

  useEffect(() => {
    if (innerRef.current) {
      setHeight(innerRef.current.scrollHeight);
    }
  }, [children]);

  return (
    <div className={(className ? className : "")}>
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <h3 className="text-3xl font-semibold text-gray-800">{title}</h3>
        {open ? (
          <ChevronUp className="w-8 h-8" />
        ) : (
          <ChevronDown className="w-8 h-8" />
        )}
      </div>

      <div
        style={{
          height: open ? `${height}px` : "0px",
        }}
        className={`overflow-hidden transition-[height,opacity] duration-300 ease-in-out ${
          open ? "opacity-100 mt-2" : "opacity-0"
        }`}
      >
        <div ref={innerRef} className="text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}