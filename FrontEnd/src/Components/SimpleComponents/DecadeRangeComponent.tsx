import React, { useState, useEffect } from "react";
import Slider from "react-slider";
import "./SliderComponent.scss";

type DecadeRangeProps = {
  // min, max of the slider and its current values (2 max recommanded)
  min: number;
  max: number;
  value: number[]; 
  // on change of the table of values
  onChange: (value: number[]) => void;
};

const DecadeRangeComponent: React.FC<DecadeRangeProps> = ({ min, max, value, onChange }) => {
  const [range, setRange] = useState<number[]>(value);

  // define on load the default range of the slider 
  useEffect(() => {
    setRange(value);
  }, [value]);

  // handle the change by setting the new range 
  const handleChange = (newValue: number[]) => {
    setRange(newValue);
  };

  // update the new values when its changed
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
