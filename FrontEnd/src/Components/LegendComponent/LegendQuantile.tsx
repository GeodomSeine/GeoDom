import { LegendData } from "../../services/api";
import "./Legend.scss";


type Props = {
    variable : string;
    legendData : LegendData
}

const LegendQuantile = ({ variable, legendData } : Props) => {
  if (!legendData || legendData.sld || !legendData.colors) return null;

  return (
    <div className="legend-container">
      <h3 className="legend-title">{variable}</h3>
      <div className="legend-items">
        {legendData.colors.map((entry, index) => (
          <div key={index} className="legend-item">
            <div
              className="legend-color-box"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="legend-label">
              {entry.range[0].toFixed(2)} - {entry.range[1].toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegendQuantile;
