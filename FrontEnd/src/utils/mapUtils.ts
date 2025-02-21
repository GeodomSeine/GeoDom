import { LatLngBounds } from "leaflet";
import { GeoJsonResponse } from "../services/api"; // Import types if needed

/**
 * Calculate the bounding box of a map (geoJson).
 * @param bassin - The GeoJSON response 
 * @returns A LatLngBounds object to fit the map.
 */
export const calculateBounds = (bassin: GeoJsonResponse): LatLngBounds => {
    if (!bassin || !bassin.features.length) return new LatLngBounds([0, 0], [0, 0]);

    const coordinates = bassin.features[0]?.geometry?.coordinates[0];
    if (!coordinates) return new LatLngBounds([0, 0], [0, 0]);

    let minLat = 90,
        maxLat = -90,
        minLng = 180,
        maxLng = -180;  

    coordinates.forEach(([lng, lat]: number[]) => {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
    });

    return new LatLngBounds([minLat, minLng], [maxLat, maxLng]);
};

export const getColor = (name: string) =>{
    return getComputedStyle(document.documentElement).getPropertyValue(name);
};
