"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFile } from "../app/context/filecontext";
import { useEffect, useState } from "react";

export default function Tabs() {
  const pathname = usePathname();
  const { selectedFile } = useFile();
  const [hasClass, setHasClass] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedFile) return;

    setLoading(true);

    fetch(`/data/${selectedFile}`)
      .then(res => res.json())
      .then(data => {
        setHasClass(!!data.class);
      })
      .catch(err => {
        console.error("Error loading file:", err);
        setHasClass(false);
      })
      .finally(() => setLoading(false));
  }, [selectedFile]);

  const tabs = [
    { name: "General information", href: "/factors/general" },
    { name: "Classes distribution", href: "/factors/classes", show: hasClass },
    { name: "Factor and data overlay", href: "/factors/dataoverlay" },
    { name: "Similarity of factors", href: "/factors/factorssimilarity" },
  ];

  if (loading) {
    return <div className="p-4 text-gray-500">Loading tabs...</div>;
  }

  return (
    <ul className="bg-zinc-50 px-10 flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200">
      {tabs
        .filter(tab => tab.show !== false)
        .map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href} className="me-2">
              <Link
                href={tab.href}
                className={`inline-block p-4 rounded-t-lg ${
                  active
                    ? "text-blue-600 bg-gray-100 border-b-2 border-blue-600"
                    : "hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.name}
              </Link>
            </li>
          );
        })}
    </ul>
  );
}
