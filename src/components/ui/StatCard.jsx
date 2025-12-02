import React from "react";
import "./StatCard.css";

export default function StatCard({ label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color + "22" }}>
        <span style={{ color }}>?</span>
      </div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}
