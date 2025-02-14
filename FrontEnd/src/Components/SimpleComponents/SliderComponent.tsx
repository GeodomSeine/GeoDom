import React from "react";
import Slider from "react-slider";
import './SliderComponent.scss';
type CustomSliderProps = {
  min: number; 
  max: number; 
  step: number; 
  onChange: (value: number) => void; 
  leftLabel: string;
  rightLabel: string;
};


const SliderComponent: React.FC<CustomSliderProps> = ({ min, max, step, onChange, leftLabel, rightLabel }) => {

  return (

    <div className="slider_container">
        <div className="slider_text"><p>{leftLabel}</p><p>{rightLabel}</p></div>
        <Slider
          className="slider_track"
          thumbClassName="slider_thumb"
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
        />
    </div>
  );
};

export default SliderComponent;
