import React, { ReactNode, useEffect, useRef, useState } from "react";
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
}

const MapControls: React.FC<MapControlsProps> = ({ bounds, children }) => {
    const map = useMap();
    const [isVisible, setIsVisible] = useState(true);
    // const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        zoomToBounds();
    }, [bounds])

    const zoomToBounds = () => {
        if (bounds) {
            map.fitBounds(bounds);
        }
    };

    // need to be fixed
    // useEffect(() => {
    //     if (container.current) {
    //         const stopPropagation = (e: Event) => e.stopPropagation();
    //         const current = container.current;

    //         current.addEventListener('click', stopPropagation);
    //         current.addEventListener('mousedown', stopPropagation);
    //         current.addEventListener('dblclick', stopPropagation);
    //         current.addEventListener('wheel', stopPropagation);
    //         current.addEventListener('touchstart', stopPropagation);

    //         return () => {
    //             current.removeEventListener('click', stopPropagation);
    //             current.removeEventListener('mousedown', stopPropagation);
    //             current.removeEventListener('dblclick', stopPropagation);
    //             current.removeEventListener('wheel', stopPropagation);
    //             current.removeEventListener('touchstart', stopPropagation);
    //         };
    //     }
    // }, []);

    //ref={container}
    return (
        <div className="map_buttons" >
            <div className="map_buttons_default">
                {bounds && (
                    <LogoComponent Icon={Expand} size={"35px"} onClick={zoomToBounds} />
                )}
                <LogoComponent Icon={Add} size={"35px"} onClick={() => map.setZoom(map.getZoom() + 1)} />
                <LogoComponent Icon={Minus} size={"35px"} onClick={() => map.setZoom(map.getZoom() - 1)} />
                {children && <LogoComponent Icon={Burger} size={"35px"} onClick={() => setIsVisible((prev) => !prev)}/>}
            </div>
            {children && (
                <div onClick={zoomToBounds} className={`map_buttons_children ${isVisible ? "" : "hidden"}`}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default MapControls;