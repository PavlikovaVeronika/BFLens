"use client";

import React from "react";
import { useFile } from "../../../app/context/filecontext";
import Description from "@/components/Description.js";
import ChartContainer from "@/components/ChartContainer";

export default function Class() {
  const { selectedFile } = useFile();

  return (
    <div className="flex flex-col py-5">
      <div className="flex flex-col mb-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            General distribution of classes in dataset
          </h2>

          <Description
            text={
              "This pie chart shows the distribution of objects in a dataset across classes. Each object belongs to only one class. To explore the chart in more detail, hover your mouse over the individual parts of the chart."
            }
          />
        </div>

        <ChartContainer
          type="classPieChart"
          renderChart={(charts, ref, size) => {
            if (!selectedFile) return;
            charts.makeClassPieChart(ref, { size: size });
          }}
        />
      </div>

      <div className="flex flex-col mb-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            General distribution of classes in found factors
          </h2>

          <Description
            text={
              "This bar chart shows the distribution of classes across factors. The X-axis shows the factors, while the Y-axis shows the number of objects belonging to the factor. Each class is color-coded. Hover over the individual columns and their sections for more details."
            }
          />
        </div>

        <ChartContainer
          type="factorsClasses"
          renderChart={(charts, ref, size) => {
            if (!selectedFile) return;
            charts.makeFactorsClassesStackedBarchart(ref, { size: size });
          }}
        />
      </div>
    </div>
  );
}
