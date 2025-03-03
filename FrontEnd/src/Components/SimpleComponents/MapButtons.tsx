import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import LogoComponent from "./LogoComponent";
import Add from "../../assets/add.svg?react";
import Minus from "../../assets/minus.svg?react";
import Expand from "../../assets/expand.svg?react";
import Burger from "../../assets/burger.svg?react";
import "./MapButtons.scss";
import L from 'leaflet';

interface MapControlsProps {
    bounds: LatLngBounds | null;
    children?: ReactNode;
}

const MapControls: React.FC<MapControlsProps> = ({ bounds, children }) => {
    const map = useMap();
    const [isVisible, setIsVisible] = useState(true);

    const fixedControls = useRef<HTMLDivElement | null>(null);
    const dynamicsControls = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        zoomToBounds();
    }, [bounds]);

    const zoomToBounds = () => {
        if (bounds) {
            map.fitBounds(bounds);
        }
    };

    useEffect(() => {
        if (fixedControls.current) {
            L.DomEvent.disableClickPropagation(fixedControls.current);
            L.DomEvent.disableScrollPropagation(fixedControls.current);
        }
        if (dynamicsControls.current) {
            L.DomEvent.disableClickPropagation(dynamicsControls.current);
            L.DomEvent.disableScrollPropagation(dynamicsControls.current);
        }
    }, []);

    return (
        <div className="map_buttons">
            <div className="map_buttons_default" ref={fixedControls}>
                {bounds && (
                    <LogoComponent Icon={Expand} size={"35px"} onClick={zoomToBounds} />
                )}
                <LogoComponent Icon={Add} size={"35px"} onClick={() => map.setZoom(map.getZoom() + 1)} />
                <LogoComponent Icon={Minus} size={"35px"} onClick={() => map.setZoom(map.getZoom() - 1)} />
                {children && <LogoComponent Icon={Burger} size={"35px"} onClick={() => setIsVisible((prev) => !prev)} />}
            </div>

            {children && (
                <div ref={dynamicsControls} className={`map_buttons_children ${isVisible ? "" : "hidden"}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default MapControls;
