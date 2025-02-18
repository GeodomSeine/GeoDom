import { useEffect, useState } from "react";
import { ColoredMapResponseData, GeoJsonResponse, ProgramVariable } from "../../services/api";
import { LayersControl, MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { LatLngBounds, PathOptions } from "leaflet";
import { GeoJsonObject } from "geojson";
import "./MapBaseComponent.scss";
import MapButtons from "../SimpleComponents/MapButtons";
import { getVariableSld } from "../../services/api";

const { BaseLayer, Overlay } = LayersControl;

type Props = {
  data: ColoredMapResponseData | null;
  variable: ProgramVariable;
  pkData: GeoJsonResponse | null;
  pkStyles: any[];
  bassinData: GeoJsonResponse | null;
  bassinStyle: PathOptions | null;
  bounds: LatLngBounds | null;
  getPkStyles: any;
};

interface SLDColorRule {
  min: number;
  max: number;
  color: string;
}

function parseSld(sldText: string): SLDColorRule[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(sldText, "text/xml");
  const rules: SLDColorRule[] = [];

  const ruleNodes = xmlDoc.getElementsByTagName("se:Rule");

  for (const ruleNode of ruleNodes) {
    const minNode = ruleNode.getElementsByTagName("ogc:Literal")[0];
    const maxNode = ruleNode.getElementsByTagName("ogc:Literal")[1];
    const colorNode = ruleNode.getElementsByTagName("se:SvgParameter")[0];

    if (minNode && maxNode && colorNode) {
      const min = parseFloat(minNode.textContent || "0");
      const max = parseFloat(maxNode.textContent || "100");
      const color = colorNode.textContent || "#000000";

      rules.push({ min, max, color });
    }
  }

  return rules;
}

function getColorFromSLD(value: number, rules: SLDColorRule[]): string {
  for (const rule of rules) {
    if (value >= rule.min && value <= rule.max) {
      return rule.color;
    }
  }
  return "#000000"; // Fallback color
}

function MapBaseComponent({
  data,
  variable,
  pkData,
  pkStyles,
  bassinData,
  bassinStyle,
  bounds,
  getPkStyles,
}: Props) {
  const [sldRules, setSldRules] = useState<SLDColorRule[] | null>(null);

  useEffect(() => {
    if (data?.legend[variable.var_code.toLowerCase()]?.sld) {
      getVariableSld(variable.var_code.toLowerCase())
        .then((blob) => blob?.text())
        .then((sldText) => {
          if (sldText) {
            setSldRules(parseSld(sldText));
          }
        })
        .catch((err) => console.error("Error fetching SLD:", err));
    }
  }, [variable, data]);

  function getFeatureStyle(feature: any) {
    const baseStyle = getPkStyles(feature);

    if (!data || !data.data) return baseStyle;

    const objOrdPk = feature.properties.obj_ord_pk;
    const value = data.data[objOrdPk]?.[`${variable.var_code.toLowerCase()}_p50`]; // Utilisation de p50

    if (value === undefined) return baseStyle;

    if (sldRules) {
      return {
        ...baseStyle,
        color: getColorFromSLD(value, sldRules),
      };
    } else if (data.legend[variable.var_code.toLowerCase()]?.colors) {
      const legend = data.legend[variable.var_code.toLowerCase()];
      const colorRule = legend && legend.colors
        ? legend.colors.find((rule) => value >= rule.range[0] && value <= rule.range[1])
        : null;
      return {
        ...baseStyle,
        color: colorRule ? colorRule.color : "#000000",
      };
    }

    return baseStyle;
  }

  return (
    <div className="map_base">
      <MapContainer
        attributionControl={false}
        bounds={bounds || [
          [50.9, -1.5],
          [46.5, 8.5],
        ]}
        zoom={6}
        minZoom={6}
        zoomControl={false}
      >
        <MapButtons bounds={bounds} />
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
                style={getFeatureStyle}
                interactive={true}
              />
            </Overlay>
          )}
        </LayersControl>
      </MapContainer>
    </div>
  );
}

export default MapBaseComponent;
