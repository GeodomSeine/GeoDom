import React from 'react';
import { ColoredMapResponseData } from '../../services/api';
import LegendSld from '../LegendComponent/LegendSld';
import LegendQuantile from '../LegendComponent/LegendQuantile';

type Props = {
    data: ColoredMapResponseData | null;
    variable: string;
    className: string;
};

const ColoredMapComponent: React.FC<Props> = ({ data, variable, className }) => {
  return (
    <div className={className}>
      {data && 
        (data.legend[variable].sld ? <LegendSld variable={variable}/> : <LegendQuantile variable={variable} legendData={data.legend[variable]}/>)
      }
    </div>
  );
};

export default ColoredMapComponent;