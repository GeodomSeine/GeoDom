import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";

type MapControllerProps = {
  bounds: LatLngBounds | null;
};

const MapController: React.FC<MapControllerProps> = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);

  return null;
};

export default MapController;
