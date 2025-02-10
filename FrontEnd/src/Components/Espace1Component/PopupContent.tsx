import React, { memo } from "react";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import "./PopupContent.scss";

interface PopupContentProps {
  properties: { [key: string]: any }; // Adjust based on your feature properties
  mode: "complet" | "amont-aval";
  onSelectAmont: () => void;
  onSelectAval: () => void;
}

const PopupContent: React.FC<PopupContentProps> = memo(
  ({ properties, mode, onSelectAmont, onSelectAval }) => {
    return (
      <>
        {/* Render properties dynamically */}
        {Object.entries(properties).map(([key, value]) => (
          <div  key={key}>
            <>{key}</>: {value}
          </div>
        ))}

        {/* Buttons for "amont-aval" mode */}
        {mode === "amont-aval" && (
          <div className="button-container">
            <ButtonComponent txt="Sélectionner Amont" onClick={onSelectAmont} />
            <ButtonComponent txt="Sélectionner Aval" onClick={onSelectAval} />
          </div>
        )}
      </>
    );
  }
);

export default PopupContent;
