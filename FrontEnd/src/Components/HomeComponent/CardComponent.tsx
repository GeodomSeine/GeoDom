import React from "react";
import "./CardComponent.scss";

interface ClickableCardProps {
  // title of the car + description + variables + backgroundImg
  title: string;
  description: string;
  variables: string[];
  background: string;
  // load the current Card
  onClick?: () => void;
  // set the card in preview mode or not, only created user can see it if preview
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
        {/* preview if so*/}
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
