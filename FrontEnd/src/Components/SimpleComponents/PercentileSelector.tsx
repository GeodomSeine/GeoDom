import React from "react";
import "./PercentileSelector.scss";

interface PercentileSelectorProps {
  selectedPercentile: "p5" | "p50" | "p90";
  onChange: (value: "p5" | "p50" | "p90") => void;
}

const PercentileSelector: React.FC<PercentileSelectorProps> = ({ selectedPercentile, onChange }) => {
  return (
    <div className="percentile-selector">
      {[
        { label: "Percentile 5", value: "p5" },
        { label: "Percentile 50", value: "p50" },
        { label: "Percentile 90", value: "p90" }
      ].map(({ label, value }) => (
        <label key={value} className={`radio-option ${selectedPercentile === value ? "selected" : ""}`}>
          <input
            type="radio"
            name="percentile"
            value={value}
            checked={selectedPercentile === value}
            onChange={() => onChange(value as "p5" | "p50" | "p90")}
          />
          {label}
        </label>
      ))}
    </div>
  );
};

export default PercentileSelector;
