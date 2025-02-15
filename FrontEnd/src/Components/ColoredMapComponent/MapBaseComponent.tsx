import { ColoredMapResponseData, GeoJsonResponse } from '../../services/api';
import { LayersControl, MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { LatLngBounds, PathOptions } from 'leaflet';
import { GeoJsonObject } from 'geojson';
import "./MapBaseComponent.scss";
import MapControls from '../SimpleComponents/MapButtons';

const { BaseLayer, Overlay } = LayersControl;

type Props = {
    data: ColoredMapResponseData | null;
    variable: string;
    pkData: GeoJsonResponse | null;
    pkStyles: any[];
    bassinData: GeoJsonResponse | null;
    bassinStyle: PathOptions | null;
    bounds: LatLngBounds | null;
    getPkStyles: any;
};

function MapBaseComponent({ /*data, variable,*/pkData, pkStyles, bassinData, bassinStyle, bounds, getPkStyles }: Props) {    
    
    return (
        <div className="map_base">
            <MapContainer
                attributionControl={false}
                bounds={bounds || [[50.9, -1.5], [46.5, 8.5]]}
                zoom={6} 
                minZoom={6} 
                zoomControl={false}
            >
                <MapControls bounds={bounds}/>
                <LayersControl>
                    <BaseLayer checked name="BaseLayer">
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        />
                    </BaseLayer>

                    {bassinData && bassinStyle && (
                        <Overlay checked name="Bassin">
                          <GeoJSON
                            data={bassinData as GeoJsonObject}
                            style={() => bassinStyle}
                            interactive={false}
                          />
                        </Overlay>
                    )}
                          
                    {pkData && pkStyles && (
                        <Overlay checked name="Hydrographie">
                            <GeoJSON
                                key={`pk-${pkData.features.length}`}
                                data={pkData as GeoJsonObject}
                                style={getPkStyles}
                                interactive={true}
                            />
                        </Overlay>
                    )}
                </LayersControl>
            </MapContainer>
        </div>
    )
}

export default MapBaseComponent