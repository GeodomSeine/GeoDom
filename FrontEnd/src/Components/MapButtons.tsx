import React from "react";
import { useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import LogoComponent from "./LogoComponent";
import Add from "../assets/add.svg?react";
import Minus from "../assets/minus.svg?react";
import Expand from "../assets/expand.svg?react";
import "./MapButtons.scss";

interface MapControlsProps {
    bounds: LatLngBounds | null;

}

const MapControls: React.FC<MapControlsProps> = ({ bounds }) => {
    const map = useMap();

    const zoomToBounds = () => {
        if (bounds) {
        map.fitBounds(bounds);
        }
    };

    return (
        <div className="custom_map_buttons">
            {bounds && (
                <LogoComponent Icon={Expand} size={"35px"} onClick={zoomToBounds} />
            )}
            <LogoComponent Icon={Add} size={"35px"} onClick={() => map.setZoom(map.getZoom() + 1)} />
            <LogoComponent Icon={Minus} size={"35px"} onClick={() => map.setZoom(map.getZoom() - 1)} />
        </div>
    );
};

export default MapControls;