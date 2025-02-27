import React from "react";
import "./CardComponent.scss";

interface ClickableCardProps {
  title: string;
  description: string;
  variables: string[];
  background: string;
  onClick?: () => void;
  is_actived: boolean;
}

const CardComponent: React.FC<ClickableCardProps> = ({
  title,
  description,
  variables,
  background,
  onClick,
  is_actived
}) => {

  return (
    <div onClick={onClick} className="card_component">
      <div className="card_text">
        <h2>{(is_actived) ? title: title + " (Preview)"}</h2>
        <p>{description}</p>
        <div>
          <strong>Variables: </strong>
          <span>{variables.join(", ")}</span>
        </div>
      </div>
      <img className="card_img" src={background} />
    </div>
  );
};

export default CardComponent;
