"use client";

export default function Description({ text, className = "" }) {
  return (
    <div className={`flex items-center gap-2 text-gray-600 p-5 rounded-lg border border-gray-200 ${className}`}>
      <i className="ri-information-line text-lg"></i>
      <p className="">{text}</p>
    </div>
  );
}
