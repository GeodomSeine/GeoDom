import React, { useState, useEffect } from "react";
import Slider from "react-slider";
import "./DecadeRangeComponent.scss";

type DecadeRangeProps = {
  min: number;
  max: number;
  value: number[]; 
  onChange: (value: number[]) => void;
};

const DecadeRangeComponent: React.FC<DecadeRangeProps> = ({ min, max, value, onChange }) => {
  const [range, setRange] = useState<number[]>(value);

  useEffect(() => {
    setRange(value);
  }, [value]);

  const handleChange = (newValue: number[]) => {
    setRange(newValue);
  };

  const handleAfterChange = (newValue: number[]) => {
    onChange(newValue);
  };

  return (
    <div className="range_container">
      <div className="range_labels">
        Décades
      </div>
      
      <Slider
        className="range_slider"
        thumbClassName="range_thumb"
        trackClassName="range_track"
        min={min}
        max={max}
        value={range}
        onChange={handleChange} 
        onAfterChange={handleAfterChange}
        pearling
        minDistance={1}
      />

      <div className="range_values">
        <span>{range[0]}</span>
        <span>{range[1]}</span>
      </div>
    </div>
  );
};

export default DecadeRangeComponent;
