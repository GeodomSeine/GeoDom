import React from 'react';
import DecadeRangeComponent from '../SimpleComponents/DecadeRangeComponent';
import { ColoredMapResponseData } from '../../services/api';
import LegendSld from '../LegendComponent/LegendSld';
import LegendQuantile from '../LegendComponent/LegendQuantile';

type Props = {
    handleDecadeChange: (value: number[]) => void;
    data: ColoredMapResponseData | null;
};

const ColoredMapComponent: React.FC<Props> = ({ handleDecadeChange, data }) => {
  return (
    <div>
      <DecadeRangeComponent onChange={handleDecadeChange} min={1} max={36} step={1} leftLabel={'1'} rightLabel={'36'} />
      {data && (
        <div>
          {Object.entries(data.legend).map(([variable, legendData]) => (
            legendData.sld ? <LegendSld variable={variable}/> : <LegendQuantile variable={variable} legendData={legendData}/>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColoredMapComponent;