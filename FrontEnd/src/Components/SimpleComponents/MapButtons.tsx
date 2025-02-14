import React, { ReactNode, useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import LogoComponent from "./LogoComponent";
import Add from "../../assets/add.svg?react";
import Minus from "../../assets/minus.svg?react";
import Expand from "../../assets/expand.svg?react";
import Burger from "../../assets/burger.svg?react";
import "./MapButtons.scss";

interface MapControlsProps {
    bounds: LatLngBounds | null;
    children?: ReactNode;
    hasController?: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({ bounds, children, hasController = true }) => {
    const map = useMap();
    useEffect(() => {
        zoomToBounds();
    }, [bounds])

    const zoomToBounds = () => {
        if (bounds) {
            map.fitBounds(bounds);
        }
    };

    const [isVisible, setIsVisible] = useState(true);

    return (
        <div className="map_buttons">
            <div className="map_buttons_default">
                {bounds && (
                    <LogoComponent Icon={Expand} size={"35px"} onClick={zoomToBounds} />
                )}
                <LogoComponent Icon={Add} size={"35px"} onClick={() => map.setZoom(map.getZoom() + 1)} />
                <LogoComponent Icon={Minus} size={"35px"} onClick={() => map.setZoom(map.getZoom() - 1)} />
                {hasController && <LogoComponent Icon={Burger} size={"35px"} onClick={() => setIsVisible((prev) => !prev)}/>}
            </div>
            {hasController && (
                <div className={`map_buttons_children ${isVisible ? "" : "hidden"}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default MapControls;