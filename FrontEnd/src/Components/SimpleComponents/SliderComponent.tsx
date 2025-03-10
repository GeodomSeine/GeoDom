import React from "react";
import Slider from "react-slider";
import './SliderComponent.scss';
type CustomSliderProps = {
  // value currently displayed on the slider
  value?: number;
  // min and max value of the slider
  min: number; 
  max: number; 
  // step like its name says, between each possible value of the slider
  step: number; 
  // the function that the slider trigger when changed
  onChange: (value: number) => void; 
  // left and right text of the slider
  leftLabel: string;
  rightLabel: string;
};

const SliderComponent: React.FC<CustomSliderProps> = ({ value, min, max, step, onChange, leftLabel, rightLabel }) => {
  return (
    <div className="slider_container">
        {/* Labels of the slider */}
        <div className="slider_text"><span>{leftLabel}</span><span>{rightLabel}</span></div>
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
