import React from "react";
import "./ChartPlaceholder.css";

export default function ChartPlaceholder({ title }) {
  return (
    <section className="chart-card">
      <header className="chart-header">{title}</header>
      <div className="chart-body">Chart goes here</div>
    </section>
  );
}
