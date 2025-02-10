import React, { ReactNode, useState } from "react";
import "./ToggleComponent.scss";
import Arrow from "../../assets/down_arrow.svg?react";
import LogoComponent from "../LogoComponent";

interface ToggleContainerProps {
  title: string;
  children: ReactNode;
}

const ToggleContainer: React.FC<ToggleContainerProps> = ({
  title,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="space_container">
      <div className="space_header">
        <h2>{title}</h2>
        <LogoComponent
          className={isVisible ? "is_visible" : "set_is_visible"}
          size={"35px"}
          Icon={Arrow}
          onClick={() => setIsVisible((prev) => !prev)} program={""} selectedVariables={[]} selectedScenarios={[]} idHydStart={null} idHydEnd={null} download={false} selectedPk={undefined} selectedStralher={null}        />
      </div>
      <div className="space_body" style={{ display: isVisible ? "flex" : "none" }}>
        {children}
      </div>
    </div>
  );
};

export default ToggleContainer;
