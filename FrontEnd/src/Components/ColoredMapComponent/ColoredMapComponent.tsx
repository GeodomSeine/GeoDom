import React from 'react';
import { ColoredMapResponseData, GeoJsonResponse, ProgramVariable } from '../../services/api';
import LegendSld from '../LegendComponent/LegendSld';
import LegendQuantile from '../LegendComponent/LegendQuantile';
import MapBaseComponent from './MapBaseComponent';
import { LatLngBounds, PathOptions } from 'leaflet';

type Props = {
  mapRef: any;
  mapLegendRef: any;
  data: ColoredMapResponseData | null;
  variable: ProgramVariable;
  className?: string;
  pkData: GeoJsonResponse | null;
  pkStyles: any[];
  bassinData: GeoJsonResponse | null;
  bassinStyle: PathOptions | null;
  bounds: LatLngBounds | null;
  getPkStyles: any;
  percentile: "p5" | "p50" | "p90";
};

const ColoredMapComponent: React.FC<Props> = ({ mapRef, mapLegendRef, data, variable, className, pkData, pkStyles, bassinData, bassinStyle, bounds, getPkStyles, percentile }) => {
  return (
    <div className={className + " body"}>

      {data &&
        <MapBaseComponent
          mapRef={mapRef}
          variable={variable}
          data={data}
          pkData={pkData}
          pkStyles={pkStyles}
          bassinData={bassinData}
          bassinStyle={bassinStyle}
          bounds={bounds}
          getPkStyles={getPkStyles}
          percentile={percentile}
        />
      }
      {data &&
        (data.legend[variable.var_code.toLowerCase()].sld ? <LegendSld legendRef={mapLegendRef} variable={variable} /> : <LegendQuantile legendRef={mapLegendRef} variable={variable} legendData={data.legend[variable.var_code.toLowerCase()]} />)
      }
    </div>
  );
};

export default ColoredMapComponent;