"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Tabs() {
  const pathname = usePathname();

  const tabs = [
    { name: "General info", href: "/factors/general" },
    { name: "Classes info", href: "/factors/classes" },
    { name: "Data overlap", href: "/factors/dataoverlap" },
    { name: "Factors overlap", href: "/factors/factorsoverlap" },
  ];

  return (
    <ul className="bg-zinc-50 px-10 flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200">
      {tabs.map((tab) => {
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