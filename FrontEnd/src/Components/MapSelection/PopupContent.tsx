import React, { memo } from "react";
import ButtonComponent from "../SimpleComponents/ButtonComponent";
import "./PopupContent.scss";

interface PopupContentProps {
  properties: { [key: string]: any }; // Adjust based on your feature properties
  mode: "complet" | "amont-aval";
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
          <div  key={key}>
            <b>{key}</b>: {value}
          </div>
        ))}

        {/* Buttons for "amont-aval" mode */}
        {layer === "Hydro" && mode === "amont-aval" && (
          <div className="control_container">
            <ButtonComponent onDark={true} txt="Sélectionner Amont" onClick={onSelectAmont} />
            <ButtonComponent onDark={true} txt="Sélectionner Aval" onClick={onSelectAval} />
          </div>
        )}
      </>
    );
  }
);

export default PopupContent;
