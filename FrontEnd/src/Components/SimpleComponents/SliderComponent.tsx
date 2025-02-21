import React from "react";
import Slider from "react-slider";
import './SliderComponent.scss';
type CustomSliderProps = {
  value?: number;
  min: number; 
  max: number; 
  step: number; 
  onChange: (value: number) => void; 
  leftLabel: string;
  rightLabel: string;
};

const SliderComponent: React.FC<CustomSliderProps> = ({ value, min, max, step, onChange, leftLabel, rightLabel }) => {

  return (
    <div className="slider_container">
        <div className="slider_text"><p>{leftLabel}</p><p>{rightLabel}</p></div>
        <Slider
          className="slider_track"
          thumbClassName="slider_thumb"
          min={min}
          max={max}
          step={step}
          onAfterChange={onChange}
          value={value !== undefined ? value : undefined}
          renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
        />
    </div>
  );
};

export default SliderComponent;
