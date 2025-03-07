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
    // the bounds of the current map where the buttons are used
    bounds: LatLngBounds | null;
    // child used to add a menu with more tools (example controlComponent)
    children?: ReactNode;
}

const MapControls: React.FC<MapControlsProps> = ({ bounds, children }) => {
    // get the current Map
    const map = useMap();
    // state of the child menu
    const [isVisible, setIsVisible] = useState(true);

    // avoid click from the leaflet map (avoid touching)
    const fixedControls = useRef<HTMLDivElement | null>(null);
    const dynamicsControls = useRef<HTMLDivElement | null>(null);

    // useEffect triggered when the bounds update (only once at loading)
    useEffect(() => {
        zoomToBounds();
    }, [bounds]);

    /**
     * fit the elements in the maps to the bounds
     * @param void
     * @returns void
     */
    const zoomToBounds = () => {
        if (bounds) {
            map.fitBounds(bounds);
        }
    };

    // avoid click from the leaflet map (avoid touching)
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
                {/* Logo that zoom in */}
                <LogoComponent Icon={Add} size={"35px"} onClick={() => map.setZoom(map.getZoom() + 1)} />
                {/* Logo that zoom out */}
                <LogoComponent Icon={Minus} size={"35px"} onClick={() => map.setZoom(map.getZoom() - 1)} />
                {/* Logo that toggle the child */}
                {children && <LogoComponent Icon={Burger} size={"35px"} onClick={() => setIsVisible((prev) => !prev)} />}
            </div>

            {/* child menu if so */}
            {children && (
                <div ref={dynamicsControls} className={`map_buttons_children ${isVisible ? "" : "hidden"}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default MapControls;
