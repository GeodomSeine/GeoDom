import React from 'react';
import { ColoredMapResponseData, GeoJsonResponse } from '../../services/api';
import LegendSld from '../LegendComponent/LegendSld';
import LegendQuantile from '../LegendComponent/LegendQuantile';
import MapBaseComponent from './MapBaseComponent';
import { LatLngBounds, PathOptions } from 'leaflet';

type Props = {
    data: ColoredMapResponseData | null;
    variable: string;
    className: string;
    pkData: GeoJsonResponse | null;
    pkStyles: any[];
    bassinData: GeoJsonResponse | null;
    bassinStyle: PathOptions | null;
    bounds: LatLngBounds | null;
    getPkStyles: any;
};

const ColoredMapComponent: React.FC<Props> = ({ data, variable, className, pkData, pkStyles, bassinData, bassinStyle, bounds, getPkStyles }) => {
  return (
    <div className={className}>
      {data && 
        (data.legend[variable].sld ? <LegendSld variable={variable}/> : <LegendQuantile variable={variable} legendData={data.legend[variable]}/>)
      }
      {data && 
        <MapBaseComponent 
          variable={variable} 
          data={data} 
          pkData={pkData} 
          pkStyles={pkStyles} 
          bassinData={bassinData} 
          bassinStyle={bassinStyle} 
          bounds={bounds} 
          getPkStyles={getPkStyles}
        />
      }
    </div>
  );
};

export default ColoredMapComponent;