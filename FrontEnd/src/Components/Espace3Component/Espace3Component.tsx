import React from "react";
import "./Espace3Component.scss";
import ToggleComponent from "../ToggleComponent/ToggleComponent";

interface Esapce3ComponentProps {
  program: string;
}
const Esapce3Component: React.FC<Esapce3ComponentProps> = ({}) => {
  
  return (
    <div className='space3'>
      {/* implement the space3 here please */}
      <ToggleComponent title="Profil en Long">
        <div>
          <div className="space3_map">

          </div>
          <div className="space3_chart">put the chart here</div>
        </div>
        <div>
        {/* <SliderComponent min={} max={} step={} onChange={} /> */}
        </div>
      </ToggleComponent>
    </div>
  );
};

export default Esapce3Component;
