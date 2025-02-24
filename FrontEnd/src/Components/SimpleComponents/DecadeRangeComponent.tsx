import React, { useState, useEffect } from "react";
import Slider from "react-slider";
import "./SliderComponent.scss";

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
    <div className="slider_container doubled">
      <div className="slider_text">
        <span>Décades</span>
      </div>
      <Slider 
        className="slider_track"
        thumbClassName="slider_thumb"
        min={min}
        max={max}
        value={range}
        onChange={handleChange} 
        onAfterChange={handleAfterChange}
        pearling
        minDistance={1}
        renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
      />
    </div>
  );
};

export default DecadeRangeComponent;
