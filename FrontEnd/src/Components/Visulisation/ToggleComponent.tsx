import React, { ReactNode, useState } from "react";
import "./ToggleComponent.scss";
import Arrow from "../../assets/right_arrow.svg?react";
import LogoComponent from "../SimpleComponents/LogoComponent";

interface ToggleContainerProps {
  // title of the component that will appear in the header
  title: string;
  // child in the space_body
  children: ReactNode;
  // secondchild in the footer (for sliders and percentile selector)
  secondChild?:ReactNode;
  className?: string;
  // define what the element contain, and how it will react, true-> for multiples elements (tiles), false-> only for one element
  containsTile?: boolean;
}

const ToggleContainer: React.FC<ToggleContainerProps> = ({
  title,
  children,
  secondChild,
  className,
  containsTile,
}) => {

  // const that keep the state of the current toggle element, true or false
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className={`space_container ${className}`}>
      {/*header of the toggle, with its title and it cross buttons , in order to 'toggle the block'*/}
      <div className="space_header" onClick={() => setIsVisible((prev) => !prev)}>
        <LogoComponent
          className={isVisible ? "is_visible" : "set_is_visible"}
          size={"35px"}
          Icon={Arrow}
          customColor=""
        />
        <h2>{title}</h2>
      </div>
      {/*body of the toggle, depending of the props, the container will render differently space_body_block (containsTile=false)-> if no tiles space_body_tiles (containsTile=true)-> if one element. and if there is a second child a space_body_footer is render'*/}
      <div className={`space_body ${isVisible ? "" : "hidden"}`}>
        {containsTile && secondChild && (
          <>
            <div className="space_body_tile">
              {children}
            </div>
            <div className="space_body_footer">
              {secondChild}
            </div>
          </>
        )}
        {containsTile && !secondChild && (
          <div className="space_body_tile">
            {children}
          </div>
        )}
        {!containsTile && !secondChild && (
          children
        )}
        {!containsTile && secondChild &&(
          <>
            <div className="space_body_block">
              {children}
            </div>
            <div className="space_body_footer">
              {secondChild}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ToggleContainer;
