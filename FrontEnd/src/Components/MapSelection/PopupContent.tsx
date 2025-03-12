import React, { memo } from "react";
import ButtonComponent from "../SimpleComponents/ButtonComponent";
import "./PopupContent.scss";

interface PopupContentProps {
  properties: { [key: string]: any }; 
  // selected mode
  mode: "complet" | "amont-aval";
  // function called depending on the current mode
  onSelectAmont: () => void;
  onSelectAval: () => void;
  layer: "Hydro" | "Station" | "PK";
}

const PopupContent: React.FC<PopupContentProps> = memo(
  ({ properties, mode, onSelectAmont, onSelectAval, layer }) => {
    return (
      <>
        {/* Render properties dynamically */}
        {Object.entries(properties).map(([key, value]) => (
          <div className="pop_up_infos" key={key}>
            <b>{key}</b><p>: {value}</p>
          </div>
        ))}

        {/* Buttons for "amont-aval" mode */}
        {layer === "Hydro" && mode === "amont-aval" && (
          <div className="popup_control_container">
            <ButtonComponent onDark={true} txt="Sélectionner Amont" onClick={onSelectAmont} />
            <ButtonComponent onDark={true} txt="Sélectionner Aval" onClick={onSelectAval} />
          </div>
        )}
      </>
    );
  }
);

export default PopupContent;
