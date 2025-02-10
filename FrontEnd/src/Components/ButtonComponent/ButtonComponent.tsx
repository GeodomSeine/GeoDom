import React, { FC } from "react";
import "./ButtonComponent.scss";

interface ButtonComponentProps {
	link?: string | null;
	txt?: string | null;
	customColor?: string;
	className?:string |null;
	onClick?: () => void;
}

const ButtonComponent: FC<ButtonComponentProps> = ({
	link = null,
	txt = "clicky",
	customColor = "var(--primary-blue)",
	className= "button_container",
	onClick,
}) => {
    //need to put into a seperate scss file
	const containerStyle: React.CSSProperties = {
		
        backgroundColor: customColor,
        cursor: "pointer",
	};

	if (link) {
		return (
			<a
				className={`${className}`}
				href={link}
				target="_blank"
				rel="noopener noreferrer"
				style={containerStyle}
				onClick={onClick}
			>
                {txt}
			</a>
		);
	} else {
		return (
			<div className={`${className}`}  style={containerStyle} onClick={onClick}>
				{txt}
			</div>
		);
	}
};

export default ButtonComponent;