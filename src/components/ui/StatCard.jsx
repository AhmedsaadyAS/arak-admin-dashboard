import React from "react";
import PropTypes from "prop-types";
import "./StatCard.css";

const StatCard = React.memo(function StatCard({ label, value, color }) {
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
});

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string.isRequired
};

export default StatCard;
