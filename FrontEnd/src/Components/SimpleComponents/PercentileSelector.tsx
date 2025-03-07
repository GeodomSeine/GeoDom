import React from "react";
import "./PercentileSelector.scss";
import InputComponent from "./InputComponent";

interface PercentileSelectorProps {
  // default percentile
  selectedPercentile: "p5" | "p50" | "p90";
  // argument function in order to update the selected percentile 
  onChange: (value: "p5" | "p50" | "p90") => void;
}

const PercentileSelector: React.FC<PercentileSelectorProps> = ({ selectedPercentile, onChange }) => {
  return (
    <div className="percentile_selector">
      {[
        { label: "Percentile 5", value: "p5" },
        { label: "Percentile 50", value: "p50" },
        { label: "Percentile 90", value: "p90" }
      ].map(({ label, value }) => (
        <>
          <InputComponent
            type="radio"
            key={label}
            checked={selectedPercentile === value}
            label={value}
            onChange={() => onChange(value as "p5" | "p50" | "p90")}
          />
        </>
      ))}
    </div>
  );
};

export default PercentileSelector;
