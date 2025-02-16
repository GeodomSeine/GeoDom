import { useEffect, useState } from "react";
import { getVariableSld } from "../../services/api";
import "./Legend.scss";

type Props = {
  variable: string;
};

interface SldLegendEntry {
  range: [number, number];
  color: string;
}

const parseSld = async (sldBlob: Blob): Promise<SldLegendEntry[]> => {
  const text = await sldBlob.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "text/xml");
  const rules = xmlDoc.getElementsByTagName("se:Rule");
  const legendEntries: SldLegendEntry[] = [];

  for (let i = 0; i < rules.length; i++) {
    const nameNode = rules[i].getElementsByTagName("se:Name")[0];
    const strokeNode = rules[i].getElementsByTagName("se:SvgParameter")[0];
    if (nameNode && strokeNode) {
      const name = nameNode.textContent || "";
      const color = strokeNode.textContent || "#000000";
      
      const rangeMatch = name.match(/([0-9.]+)\s*-\s*([0-9.]+)/);
      if (rangeMatch) {
        legendEntries.push({
          range: [parseFloat(rangeMatch[1]), parseFloat(rangeMatch[2])],
          color,
        });
      } else if (name.includes("<")) {
        const value = parseFloat(name.replace("<", "").trim());
        legendEntries.push({
          range: [0, value],
          color,
        });
      } else if (name.includes(">")) {
        const value = parseFloat(name.replace(">", "").trim());
        legendEntries.push({
          range: [value, value + 10],
          color,
        });
      }
    }
  }
  return legendEntries;
};

const LegendSld = ({ variable }: Props) => {
  const [legendEntries, setLegendEntries] = useState<SldLegendEntry[] | null>(null);

  useEffect(() => {
    const fetchSld = async () => {
      const sldBlob = await getVariableSld(variable);
      if (sldBlob) {
        const parsedLegend = await parseSld(sldBlob);
        setLegendEntries(parsedLegend);
      }
    };
    fetchSld();
  }, [variable]);

  if (!legendEntries) return null;

  return (
    <div className="legend_container">
      <div className="legend_header">{variable}</div>
      <div className="legend_body">
        {legendEntries.map((entry, index) => (
          <div key={index} className="legend_item">
            <div
              className="legend_color_box"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="legend_label">
              {entry.range[0].toFixed(2)} - {entry.range[1].toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegendSld;
