import React, { useState } from "react";
import Slider from "react-slider";
import './DecadeRangeComponent.scss';

type DecadeRangeProps = {
  min: number;
  max: number;
  step: number;
  onChange: (value: number[]) => void;
  leftLabel: string;
  rightLabel: string;
};

const DecadeRangeComponent: React.FC<DecadeRangeProps> = ({ min, max, step, onChange, leftLabel, rightLabel }) => {
  const [range, setRange] = useState<number[]>([min, max]);

  const handleChange = (value: number[]) => {
    setRange(value);
    onChange(value);
  };

  return (
    <div className="slider_container">
      <div className="slider_text"><p>{leftLabel}</p><p>{rightLabel}</p></div>
      <Slider
        className="slider_track"
        thumbClassName="slider_thumb"
        min={min}
        max={max}
        step={step}
        value={range}
        onChange={handleChange}
        renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
        pearling
        minDistance={1} // Permet d'éviter que les deux curseurs soient au même endroit
      />
    </div>
  );
};

export default DecadeRangeComponent;