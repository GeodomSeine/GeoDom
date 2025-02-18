import { LegendData, ProgramVariable } from "../../services/api";
import "./Legend.scss";


type Props = {
    variable : ProgramVariable;
    legendData : LegendData
}

const LegendQuantile = ({ variable, legendData } : Props) => {
  if (!legendData || legendData.sld || !legendData.colors) return null;

  return (
    <div className="legend_container">
      <div className="legend_header">{`${variable.var_name} (${variable.unit_short})`}</div>
      <div className="legend_body">
        {legendData.colors.map((entry, index) => (
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

export default LegendQuantile;
