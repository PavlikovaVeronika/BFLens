"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Row({ title, children, defaultOpen = false, height = null }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <div
        className="py-5 flex items-center cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <h3 className="text-3xl font-semibold text-gray-800">{title}</h3>
        {open ? (
          <ChevronUp className="w-8 h-8" />
        ) : (
          <ChevronDown className="w-8 h-8" />
        )}
      </div>

      {/* TODO - pobavit se o výšce*/}
      <div
        className={`duration-300 ease-in-out transition-[opacity,height]`}
        style={{
          height: open ? `${height}px` : "0px",
          opacity: open ? 1 : 0,
          overflow: "hidden",
        }}
      >
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}