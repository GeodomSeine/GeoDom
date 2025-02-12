import { LatLngBounds } from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export const FitBounds: React.FC<{ bounds: LatLngBounds | null }> = ({ bounds }) => {
    const map = useMap();
  
    useEffect(() => {
      if (bounds) {
        map.fitBounds(bounds);
      }
    }, [bounds, map]);
  
    return null;
};